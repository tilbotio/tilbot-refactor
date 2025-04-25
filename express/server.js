import http from 'http';
import https from 'https';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import mongodbsession from 'express-mongodb-session';
import session from 'express-session';
import cors from 'cors';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import child_process from 'child_process';

import { LogModel } from './db/log.js';
import { ProjectModel } from './db/project.js';
import { UserModel } from './db/user.js';
import {
  TilBotError,
  TilBotUserNotAdminError,
  TilBotNotLoggedInError,
  TilBotUserIsAdminError,
  TilBotNoProjectFileError,
  TilBotProjectNotFoundError,
} from './errors.js';


const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: 'tmp_upload/' });

function start_bot(projectid) {
  console.log('starting ' + projectid);
  // Check whether we are running in Docker or not
  if (process.env.TILBOT_PORT == undefined) {
    // Stop the bot if it is currently already running (Docker does this too further down the line)
    if (running_bots[projectid] !== undefined) {
      stop_bot(projectid);
    }
    running_bots[projectid] = child_process.fork('../socket-io/server.js', [projectid]);
  } else {
    // @TODO: Docker not implemented yet.
    //this.botlauncher.write('start ' + projectid);
  }
}

async function stop_bot(projectid) {
  console.log('stopping ' + projectid);
  // Check whether we are running in Docker or not
  if (process.env.TILBOT_PORT == undefined) {
    if (running_bots[projectid] !== undefined) {
      running_bots[projectid].send('exit', undefined, undefined, e => { });
    }
  } else {
    // @TODO: Docker not implemented yet
    //this.botlauncher.write('stop ' + projectid);
  }

  try {
    const project = await ProjectModel.getById(projectid);
    project.status = 0;
    await project.save();
  } catch (error) {
    console.error(`Error stopping bot: ${error}`);
  }
};

// Keep track of running external processes for bots.
let running_bots = {};

const app = express();

// Set up server for HTTP/HTTPS
let server = null;
let port = parseInt(process.env.LISTEN_PORT ?? '0');

if (fs.existsSync(__dirname + '/certs/privkey.pem') && fs.existsSync(__dirname + '/certs/pubkey.pem')) {

  const key = fs.readFileSync(__dirname + '/certs/privkey.pem');
  const cert = fs.readFileSync(__dirname + '/certs/pubkey.pem');
  var ssloptions = {
    key: key,
    cert: cert
  };

  port ||= 443;
  server = https.createServer(ssloptions, app);
} else {
  port ||= 80;
  server = http.createServer(app);
}

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

// For CORS
app.use(cors({
  allowedHeaders: ['Content-Type'],
  origin: 'http://localhost:5173',
  preflightContinue: true,
  credentials: true,
}));

// Set up the MongoDB connection
const dbPath = process.env.MONGO_USERNAME
  ? `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongo:${process.env.MONGO_PORT ?? 27017}/${process.env.MONGO_DB ?? 'tilbot'}`
  : (process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017/tilbot')

const options = { useNewUrlParser: true, useUnifiedTopology: true };
await mongoose.connect(dbPath, options);
// Make sure the express-mongodb-session can also use the existing connection
console.log(mongodbsession);
const MongoDBStore = mongodbsession(session);

// Sessions
const store = new MongoDBStore({
  // Because we are using mongoose rather than MongoDB, express-mongodb-session refuses to use the existing connection because it is not instanceof MongoDB.MongoClient
  //existingConnection: mongo.connection,
  //databaseName: process.env.MONGO_DB,
  uri: dbPath,
  collection: 'sessions'
});

// Catch errors
store.on('error', function (error) {
  console.log(error);
});

app.use(session({
  secret: 'Super secretthings',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: true,
  saveUninitialized: true,
  secure: process.env.HTTPS ? true : false,
  httpOnly: true,
  sameSite: 'none'
}));

// Launch all running bots (IIFE to run it in the background)
(async () => {
  const projects = await ProjectModel.getSummaries({ active: true, status: 1 });
  for (const project of projects) {
    start_bot(project.id);
  }
})();

// add a route that lives separately from the SvelteKit app
app.post('/api/login', async (req, res) => {
  const user = await UserModel.getByUsername(req.body.username);
  await user.checkPassword(req.body.password);
  req.session.username = req.body.username;
  req.session.save();
  res.send('OK');
});

app.get('/api/admin_account_exists', async (req, res) => {
  if (await UserModel.adminAccountExists()) {
    res.send('EXISTS');
  } else {
    await UserModel.create('admin', 'admin', 99);
    res.send('CREATED');
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.send('OK');
});

app.post('/api/change_pass', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  await user.updatePassword(req.body.oldpass, req.body.newpass);
  res.send('OK');
});

app.post('/api/create_user_account', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  // Check if user is admin
  if (user.role != 99) {
    throw new TilBotUserNotAdminError();
  }
  await UserModel.create(req.body.username, req.body.password, 1);
  res.send('OK');
});

app.post('/api/set_user_active', async (req, res) => {
  const user = await UserModel.getByUsername(req.session.username);
  if (user.role != 99) {
    throw new TilBotUserNotAdminError();
  }

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
  res.send('OK');
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
  res.send(JSON.stringify(data));
});

app.post('/api/create_project', async (req, res) => {
  await ProjectModel.create(req.session.username);
  res.send('OK');
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
  res.send('OK');
});

// API call: retrieve a project's socket if active -- anyone can do this, no need to be logged in.
app.get('/api/get_socket', async (req, res) => {
  const project = await ProjectModel.getById(req.query.id, { active: true, status: 1 });
  res.send(project.socket.toString());
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

  if (status) {
    start_bot(req.body.projectid);
  } else {
    stop_bot(req.body.projectid);
  }

  res.send('OK');
});

/**
 * API call: Import a project
 */
app.post('/api/import_project', upload.single('file'), async (req, res) => {
  try {
    // Source: https://medium.com/@ritikkhndelwal/getting-the-data-from-the-multipart-form-data-in-node-js-dc2d99d10f97

    console.log('=== IMPORT PROJECT ===');
    console.log(req.body);

    const project_id = req.body.project_id;

    // Be extra careful because we're going to do filesystem operations here!
    if (!/^[0-9a-f]{32}$/.test(project_id)) {
      throw new TilBotProjectNotFoundError(project_id);
    }

    // Ensure that the project exists and is owned by the user:
    const project = await ProjectModel.getById(project_id, { user_id: req.session.username });

    const priv_dir = 'projects/' + project_id;
    const pub_dir = 'proj_pub/' + project_id;

    fs.rmSync(priv_dir, { recursive: true, force: true });
    fs.mkdirSync(priv_dir, { recursive: true });

    fs.rmSync(pub_dir, { recursive: true, force: true });
    fs.mkdirSync(pub_dir, { recursive: true });

    const zip = new AdmZip(req.file.path);
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

    if (running_bots[project_id] !== undefined) {
      await stop_bot(project_id);
    }

    project.fromModel(JSON.parse(project_data));
    await project.save();
  } finally {
    // Remove the temporary file
    fs.rmSync(req.file.path);
  }
  res.send('OK');
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
  res.send('OK');
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
  res.send(project.getLogs());
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
  res.send('OK');
});

app.get('/api/sesh', (req, res) => {
  console.log(req.session);
  res.send('OK');
});

// In production, let SvelteKit handle everything else, including serving prerendered pages and static assets
if (fs.existsSync('./build/handler.js')) {
  (async () => {
    try {
      const m = await import('./build/handler.js');
      app.use('/proj_pub', express.static('./proj_pub'));
      app.use(m.handler);
    } catch (error) {
      console.error(`Error importing Sveltekit handler`);
    }
  })();
}

// Must be last in order to catch errors from all routes
app.use((err, req, res, next) => {
  if (res.headersSent) {
    // Not much we can do now that (some) data has already been sent.
    console.log(err);
    next();
  } else if (err instanceof TilBotError) {
    res.send(err.api_status_code);
  } else {
    console.log(err);
    res.send('NOK');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log('listening on port ' + port);
});
