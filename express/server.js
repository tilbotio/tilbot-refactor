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
const upload = multer({ dest: 'tmp_upload/' });
import AdmZip from 'adm-zip';
import fs from 'fs';
import child_process from 'child_process';
import { UserApiController } from './api/user.js';
import { ProjectApiController } from './api/project.js';
import { SettingsApiController } from './api/settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function start_bot(projectid) {
  console.log('starting ' + projectid);
  // Check whether we are running in Docker or not
  if (process.env.TILBOT_PORT != undefined) {
    // @TODO: Docker not implemented yet.
    //this.botlauncher.write('start ' + projectid);
  } else {
    // Stop the bot if it is currently already running (Docker does this too further down the line)
    if (running_bots[projectid] !== undefined) {
      stop_bot(projectid);
    }
    running_bots[projectid] = child_process.fork('../socket-io/server.js', [projectid]);
  }
}

async function stop_bot(projectid) {
  console.log('stopping ' + projectid);
  // Check whether we are running in Docker or not
  if (process.env.TILBOT_PORT != undefined) {
    // @TODO: Docker not implemented yet
    //this.botlauncher.write('stop ' + projectid);
  } else {
    if (running_bots[projectid] !== undefined) {
      running_bots[projectid].send('exit', undefined, undefined, (e) => {
      });
    }
  }

  try {
    await ProjectApiController.set_project_status(projectid, 0);
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
const dbPath = process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017/tilbot';

console.log(dbPath);

if (process.env.MONGO_USERNAME != undefined) {
  dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
}

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
  const projects = await ProjectApiController.get_running_projects();
  for (const project of projects) {
    start_bot(project.id);
  }
})();

// add a route that lives separately from the SvelteKit app
app.post('/api/login', async (req, res) => {
  res.status(200);
  const success = await UserApiController.login(req.body.username, req.body.password);
  if (success) {
    req.session.username = req.body.username;
    req.session.save();
    res.send('OK');
  } else {
    res.send('NOK');
  }
});

app.get('/api/admin_account_exists', async (req, res) => {
  res.status(200);
  const admin = await UserApiController.get_admin_user();
  if (admin === null) {
    UserApiController.create_account('admin', 'admin', 99);
    res.send('CREATED');
  } else {
    res.send('EXISTS');
  }
});

app.post('/api/logout', (req, res) => {
  res.status(200);
  req.session.destroy();
  res.send('OK');
});

app.post('/api/change_pass', async (req, res) => {
  const success = await UserApiController.update_password(req.session.username, req.body.oldpass, req.body.newpass);
  res.send(success);
});

app.post('/api/create_user_account', async (req, res) => {
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    // Check if user is admin
    if (user.role == 99) {
      const success = await UserApiController.create_account(req.body.username, req.body.password, 1);
      console.log(success);
      res.send(success);
    } else {
      res.send('USER_NOT_ADMIN');
    }
  } else {
    res.send('USER_NOT_FOUND');
  }
});

app.post('/api/set_user_active', async (req, res) => {
  res.status(200);
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    if (user.role == 99) { //admin
      await UserApiController.set_user_active(req.body.username, req.body.active);
      // If a user was set to inactive, stop all of their running projects.
      if (req.body.active == 'false') {
        const projects = await ProjectApiController.get_running_projects_user(req.body.username);
        for (const p of projects) {
          await ProjectApiController.set_project_status(p.id, 0);
          stop_bot(p.id);
        }
      }
      res.send('OK');
    } else {
      res.send('USER_NOT_ADMIN');
    }
  } else {
    res.send('USER_NOT_FOUND');
  }
});

app.get('/api/get_dashboard', async (req, res) => {
  res.status(200);
  // Return error message if not logged in
  if (req.session.username === undefined) {
    res.send('NOT_LOGGED_IN');
  } else {
    const data = { 'username': req.session.username };
    const user = await UserApiController.get_user(req.session.username);
    if (user !== null) {
      if (user.role == 99) { // admin, retrieve user accounts
        const users = await UserApiController.get_users();
        for (const u in users) {
          const projects = await ProjectApiController.get_running_projects_user(users[u].username);
          users[u].running_projects = projects.length;
        }
        data.users = users;
        res.send(JSON.stringify(data));
      } else { // regular user, retrieve projects and settings
        const projects = await ProjectApiController.get_projects(req.session.username);
        data.projects = projects;
        const settings = await SettingsApiController.get_settings(req.session.username);
        data.settings = settings;
        res.send(JSON.stringify(data));
      }
    } else { // An invalid username is somehow in the function
      res.send('USER_NOT_FOUND');
    }
  }
});

app.post('/api/create_project', async (req, res) => {
  const response = await ProjectApiController.create_project(req.session.username);
  res.send(response);
});

/**
 * API call: change a project's status (active/inactive)
 */
app.post('/api/set_project_active', async (req, res) => {
  res.status(200);
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    if (user.role == 1) {
      const response = await ProjectApiController.get_project(req.body.projectid, req.session.username);
      if (response != null) {
        if (response.status == 1) {
          // Stop project from running first
          stop_bot(req.body.projectid);
        }

        if (!req.body.active) {
          // Make the project inactive
          const response = await ProjectApiController.set_project_active(req.body.projectid, req.body.active);
          res.send('OK');
        } else {
          // @TODO: maybe at some point also make it possible to set the project back to active.
          res.send('NOK');
        }
      } else {
        res.send('NOK');
      }
    } else {
      res.send('NOK');
    }
  } else {
    res.send('USER_NOT_FOUND');
  }
});

// API call: retrieve a project's socket if active -- anyone can do this, no need to be logged in.
app.get('/api/get_socket', async (req, res) => {
  res.status(200);
  const response = await ProjectApiController.get_socket(req.query.id);
  res.send(response);
});

// API call: change the status of a project (0 = paused, 1 = running)
app.post('/api/set_project_status', async (req, res) => {
  res.status(200);
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    if (user.role == 1) {
      const project = ProjectApiController.get_project(req.body.projectid, req.session.username);
      if (project != null) {
        const response = ProjectApiController.set_project_status(req.body.projectid, req.body.status);
        if (response) {
          console.log(req.body.status);
          if (req.body.status == 1) {
            start_bot(req.body.projectid);
          } else {
            stop_bot(req.body.projectid);
          }
          res.send('OK');
        }
      } else {
        res.send('NOK');
      }
    } else {
      res.send('NOK');
    }
  }
});

/**
 * API call: Import a project
 */
app.post('/api/import_project', upload.single('file'), async (req, res) => {
  // Source: https://medium.com/@ritikkhndelwal/getting-the-data-from-the-multipart-form-data-in-node-js-dc2d99d10f97
  const user = await UserApiController.get_user(req.session.username);

  if (user !== null) {
    console.log('=== IMPORT PROJECT ===');
    console.log(req.body);

    // Check if the private project file directory exists
    if (!fs.existsSync('projects')) {
      fs.mkdirSync('projects');
    }

    // Check if the public project file directory exists
    if (!fs.existsSync('proj_pub')) {
      fs.mkdirSync('proj_pub');
    }

    // Remove the old project files
    let priv_dir = 'projects/' + req.body.project_id;
    let pub_dir = 'proj_pub/' + req.body.project_id;

    if (fs.existsSync(priv_dir)) {
      fs.rmSync(priv_dir, { recursive: true });
    }
    fs.mkdirSync(priv_dir);

    if (fs.existsSync(pub_dir)) {
      fs.rmSync(pub_dir, { recursive: true });
    }
    fs.mkdirSync(pub_dir);

    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries(); // an array of ZipEntry records

    console.log(zipEntries);

    let found_projectfile = false;
    let api_promise = null;

    zipEntries.forEach(function (zipEntry) {
      if (zipEntry.entryName == "project.json") {
        found_projectfile = true;
        console.log('project file found');

        if (running_bots[req.body.project_id] !== undefined) {
          stop_bot(req.body.project_id);
        }

        api_promise = ProjectApiController.import_project(
          zipEntry.getData().toString("utf8"),
          req.body.project_id,
          req.session.username
        );
        // @TODO: import project file into database
        //win.webContents.send('project-load', zipEntry.getData().toString("utf8"));
      } else if (zipEntry.entryName.startsWith('var/')) {
        zip.extractEntryTo(zipEntry, priv_dir)
      } else {
        zip.extractEntryTo(zipEntry, pub_dir);
      }
    });

    if (found_projectfile) {
      const response = await api_promise();
      // Remove the temporary file
      fs.rmSync(req.file.path);

      if (response) {
        res.send('OK');
      }
      else {
        res.send('NOK');
      }
    } else {
      fs.rmSync(req.file.path);
      res.send('NO_PROJECT_FILE');
    }
  }
});

/**
 * API call: save a user's settings
 */
app.post('/api/save_settings', async (req, res) => {
  res.status(200);
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    if (user.role == 1) {
      const response = await SettingsApiController.update_settings(req.session.username, req.body.settings);
      res.send(response);
    } else {
      res.send('NOK');
    }
  } else {
    res.send('USER_NOT_FOUND');
  }
});

// API call: get a project's log files
app.get('/api/get_logs', async (req, res) => {
  res.status(200);
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    if (user.role == 1) {
      const project = await ProjectApiController.get_project(req.query.projectid, req.session.username);
      if (project == null) {
        res.send('NOK')
      } else {
        const response = ProjectApiController.get_logs(req.query.projectid);
        if (response == null) {
          res.send('NOK');
        } else {
          res.send(response);
        }
      }
    } else {
      res.send('NOK');
    }
  } else {
    res.send('NOK');
  }
});

// API call: delete a project's log files
app.post('/api/delete_logs', async (req, res) => {
  res.status(200);
  const user = await UserApiController.get_user(req.session.username);
  if (user !== null) {
    if (user.role == 1) {
      const project = await ProjectApiController.get_project(req.body.projectid, req.session.username);
      if (project == null) {
        res.send('NOK')
      } else {
        const response = await ProjectApiController.delete_logs(req.body.projectid);
        console.log(`Deleted logs: ${response}`);
        res.send(response);
      }
    } else {
      res.send('NOK');
    }
  } else {
    res.send('NOK');
  }
});

app.get('/api/sesh', (req, res) => {
  res.status(200);
  console.log(req.session);
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

server.listen(port, '0.0.0.0', () => {
  console.log('listening on port ' + port);
});
