import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import { fastifySession } from '@fastify/session';
import { fastifyCookie } from '@fastify/cookie';
import fastifyCORS from '@fastify/cors';
import fastifyFormBody from '@fastify/formbody';
import fastifyFileUpload from 'fastify-file-upload';
import fastifyMultiPart from '@fastify/multipart';
import fastifyWebSocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import AdmZip from 'adm-zip';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { randomBytes } from 'crypto';
import { LogModel } from './db/log.js';
import { ProjectModel } from './db/project.js';
import { UserModel } from './db/user.js';
import { SettingsModel } from './db/settings.js';
import {
  TilBotError,
  TilBotUserNotAdminError,
  TilBotNotLoggedInError,
  TilBotUserIsAdminError,
  TilBotNoProjectFileError,
  TilBotProjectNotFoundError,
} from './errors.js';
import ProjectController from '../app/projectcontroller.cjs';
import LLM from '../app/llm.cjs';

// Generate a somewhat persistent token:
function getOrCreateToken(tokenPath) {
  try {
    return readFileSync(tokenPath, { encoding: 'utf8' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist, generate token and save
      const token = randomBytes(32).toString('base64');
      writeFileSync(tokenPath, token, { encoding: 'utf8' });
      return token;
    } else {
      // Rethrow any other error
      throw error;
    }
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// For the MongoDB connection
const dbPath = process.env.MONGO_USERNAME
  ? `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongo:${process.env.MONGO_PORT ?? 27017}/${process.env.MONGO_DB ?? 'tilbot'}`
  : (process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017/tilbot');

const app = Fastify({ logger: true });

// Do initialization work in parallel (because why not):
await Promise.all([
  mongoose.connect(dbPath, { useNewUrlParser: true, useUnifiedTopology: true }),

  app.register(fastifyWebSocket),

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || getOrCreateToken('/tmp/cookie-secret'),
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secure: Boolean(process.env.HTTPS),
    httpOnly: true,
    sameSite: 'none',
  }),

  app.register(fastifySession, {
    cookie: {
      secure: Boolean(process.env.HTTPS),
    },
    secret: process.env.SESSION_SECRET || getOrCreateToken('/tmp/session-secret'),
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      stringify: false,
      autoRemoveInterval: 600, // minutes
    }),
  }),

  // For CORS
  app.register(fastifyCORS, {
    allowedHeaders: ['Content-Type'],
    origin: 'http://localhost:5173',
    preflightContinue: true,
    credentials: true,
  }),

  // parse application/x-www-form-urlencoded
  app.register(fastifyFormBody),

  // File uploads
  app.register(fastifyFileUpload, {
    safeFileNames: true,
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: '/tmp',
  }),

  app.register(fastifyMultiPart),
]);


// add a route that lives separately from the SvelteKit app
app.post('/api/login', async (req, res) => {
  const user = await UserModel.getByUsername(req.body.username);
  await user.checkPassword(req.body.password);
  req.session.username = req.body.username;
  req.session.save();
});

app.get('/api/admin_account_exists', async (req, res) => {
  if (await UserModel.adminAccountExists()) {
    return 'EXISTS';
  } else {
    await UserModel.create('admin', 'admin', 99);
    return 'CREATED';
  }
});

app.post('/api/logout', async (req, res) => {
  req.session.destroy();
});

app.post('/api/change_pass', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  await user.updatePassword(req.body.oldpass, req.body.newpass);
});

app.post('/api/create_user_account', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  // Check if user is admin
  if (user.role != 99) {
    throw new TilBotUserNotAdminError();
  }
  await UserModel.create(req.body.username, req.body.password, 1);
});

app.post('/api/set_user_active', async (req, res) => {
  const session_user = await UserModel.getByUsername(req.session.username);
  if (session_user.role != 99) {
    throw new TilBotUserNotAdminError();
  }

  const user = await UserModel.getByUsername(req.body.username);
  user.active = req.body.active;
  await user.save();
  // If a user was set to inactive, stop all of their running projects.
  if (!req.body.active) {
    const projects = await ProjectModel.find({
      user_id: req.body.username,
      active: true,
      status: 1,
    });
    for (const project of projects) {
      project.status = 0;
      await project.save();
      stop_bot(project.id);
    }
  }
});

app.get('/api/get_dashboard', async (req, res) => {
  // Return error message if not logged in
  if (req.session.username == undefined) {
    throw new TilBotNotLoggedInError();
  }
  const data = { 'username': req.session.username };
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role == 99) { // admin, retrieve user accounts
    const users = await UserModel.getSummaries();
    for (const user of users) {
      const projects = await ProjectModel.getSummaries({
        user_id: user.username,
        active: true,
        status: 1,
      });
      user.running_projects = projects.length;
    }
    data.users = users;
  } else { // regular user, retrieve projects and settings
    data.projects = await ProjectModel.getSummaries({
      user_id: req.session.username,
      active: true,
    });
    data.settings = await user.getPermittedSettings();
  }
  return JSON.stringify(data);
});

app.post('/api/create_project', async (req, res) => {
  await ProjectModel.create(req.session.username);
});

/**
 * API call: change a project's status (active/inactive)
 */
app.post('/api/set_project_active', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role != 1) {
    throw new TilBotUserIsAdminError(req.session.username);
  }

  const project = await ProjectModel.getById(req.body.projectid, { user_id: req.session.username, active: true });
  if (project.status == 1) {
    // Stop project from running first
    stop_bot(req.body.projectid);
  }

  if (req.body.active) {
    // @TODO: maybe at some point also make it possible to set the project back to active.
    throw new TilBotError();
  } else {
    // Make the project inactive
    project.active = req.body.active;
    await project.save();
  }
});

// API call: change the status of a project (0 = paused, 1 = running)
app.post('/api/set_project_status', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role != 1) {
    throw new TilBotUserIsAdminError(req.session.username);
  }

  // Ensure that this project is owned by the user who is logged in:
  const project = await ProjectModel.getById(req.body.projectid, {
    user_id: req.session.username,
    active: true,
  });

  console.log(req.body.status);
  const status = req.body.status ? 1 : 0;
  project.status = status;
  project.save();

  if (status == 0) {
    stop_bot(req.body.projectid);
  }
});

/**
 * API call: Import a project
 */
app.post('/api/import_project', async (req, res) => {
  // Source: https://medium.com/@ritikkhndelwal/getting-the-data-from-the-multipart-form-data-in-node-js-dc2d99d10f97

  console.log('=== IMPORT PROJECT ===');
  console.log(req.body);

  const project_id = req.body.project_id;

  // Be extra careful because we're going to do filesystem operations here!
  if (!/^[0-9a-f]{32}$/.test(project_id)) {
    throw new TilBotProjectNotFoundError(project_id);
  }

  // Ensure that the project exists and is owned by the user:
  console.log(`project id: '${project_id}' user: '${req.session.username}'`);
  const project = await ProjectModel.getById(project_id, { user_id: req.session.username });

  const priv_dir = 'projects/' + project_id;
  const pub_dir = 'proj_pub/' + project_id;

  rmSync(priv_dir, { recursive: true, force: true });
  mkdirSync(priv_dir, { recursive: true });

  rmSync(pub_dir, { recursive: true, force: true });
  mkdirSync(pub_dir, { recursive: true });

  const zip = new AdmZip(req.raw.files.file.tempFilePath);
  const zipEntries = zip.getEntries(); // an array of ZipEntry records

  console.log(zipEntries);

  let project_data = null;

  zipEntries.forEach(zipEntry => {
    if (zipEntry.entryName == "project.json") {
      project_data = zipEntry.getData().toString("utf8");

      // @TODO: import project file into database
      //win.webContents.send('project-load', zipEntry.getData().toString("utf8"));
    } else if (zipEntry.entryName.startsWith('var/')) {
      zip.extractEntryTo(zipEntry, priv_dir);
    } else {
      zip.extractEntryTo(zipEntry, pub_dir);
    }
  });

  if (project_data == null) {
    throw new TilBotNoProjectFileError();
  }

  console.log('project file found');

  if (project.status == 1) {
    await stop_bot(project_id);
  }

  project.fromModel(JSON.parse(project_data));
  await project.save();
});

/**
 * API call: save a user's settings
 */
app.post('/api/save_settings', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role !== 1) {
    throw new TilBotUserIsAdminError(req.session.username);
  }
  const settings = await user.getSettings();
  await settings.update(JSON.parse(req.body.settings));
});

// API call: get a project's log files
app.get('/api/get_logs', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role !== 1) {
    throw new TilBotUserIsAdminError(req.session.username);
  }
  if (!req.query.projectid) {
    throw new TilBotProjectNotFoundError();
  }
  const project = await ProjectModel.getById(req.query.projectid, {
    user_id: req.session.username,
    active: true,
  });
  return project.getLogs();
});

// API call: delete a project's log files
app.post('/api/delete_logs', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role !== 1) {
    throw new TilBotUserIsAdminError(req.session.username);
  }
  // Ensure the project exists and is owned by the current user
  await ProjectModel.getById(req.body.projectid, {
    user_id: req.session.username,
    active: true,
  });
  await LogModel.deleteMany({ project_id: req.body.projectid });
  console.log(`Deleted logs: ${req.body.projectid}`);
});

app.get('/api/sesh', async (req, res) => {
  console.log(req.session);
});

const projectControllers = new Map();

// API call: create a new conversation for a project -- anyone can do this, no need to be logged in.
app.get('/api/create_conversation', async (req, res) => {
  const project = await ProjectModel.getById(req.query.id, { active: true, status: 1 });
  const settings = await SettingsModel.findOne({ user_id: project.user_id });

  const projectController = new ProjectController(
    project,
    __dirname + '/../projects/' + project.id,
    LLM.fromSettings(settings),
  );

  const controllerId = randomBytes(16).toString('hex');

  projectControllers.set(controllerId, projectController);

  return { conversation: controllerId, settings: project.settings };
});

app.get('/ws/chat', { websocket: true }, async (socket, req) => {
  const projectController = projectControllers.get(req.query.conversation);
  if (!projectController) {
    throw new Error(`Conversation '${req.query.conversation}' not found`);
  }

  if (projectController.socket) {
    projectController.socket.close();
    projectController.socket = null;
  }

  socket.addEventListener('open', () => {
    if (projectController.socket) {
      // We're late to the party.
      socket.close();
    } else {
      projectController.socket = socket;
    }
  });

  socket.addEventListener('close', () => {
    if (projectController.socket === socket) {
      projectController.socket = null;
    }
  });

  socket.addEventListener('message', e => {
    const [command, ...args] = JSON.parse(e.data);
    switch (command) {
      case 'message sent':
        projectController.message_sent_event(...args);
        break;

      case 'user_message':
        projectController.receive_message(...args);
        break;

      case 'log':
        projectController.log(...args);
        break;

      case 'pid':
        projectController.set_participant_id(...args);
        break;
    }
  });
});

async function stop_bot(projectId) {
  console.log(`stopping ${projectId}`);

  try {
    const project = await ProjectModel.getById(projectid);
    project.status = 0;
    await project.save();
  } catch (error) {
    console.error(`Error stopping bot: ${error}`);
  }

  for (const socket of Object.values(socketClients[projectId] ?? {})) {
    socket.close();
  }
};

// Serve the static public files from projects.
// FIXME: also serve the compiled Svelte files.
await app.register(fastifyStatic, {
  root: 'proj_pub',
});

// Implement the default response for successful requests
app.addHook('onSend', async (req, res, payload) => {
  if (!res.sent && payload === undefined) {
    return 'OK';
  }
});

// Handle TilbotErrors by sending their api_status_code as the response
app.setErrorHandler((err, req, res) => {
  console.log(err);
  if (res.sent) {
    // Not much we can do now that data has already been sent.
  } else if (err instanceof TilBotError) {
    res.status(200);
    res.send(err.api_status_code);
  } else {
    res.send('NOK');
  }
});

const port = parseInt(process.env.LISTEN_PORT || '8000');

app.listen({ port, host: '0.0.0.0' }, (err, addr) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  } else {
    console.log(`listening on ${addr}`);
  }
});
