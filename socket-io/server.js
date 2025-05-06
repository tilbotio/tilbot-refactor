import http from 'http';
import https from 'https';
import {Server} from 'socket.io';
import fs from 'fs';
import ProjectController from '../app/projectcontroller.cjs';
import ChatGPT from '../app/chatgpt.cjs';
import LocalLLM from '../app/localllm.cjs';
import { ProjectModel } from '../backend/db/project.js';
import { SettingsModel } from '../backend/db/settings.js';
import { mongoose } from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

var server = null;
let is_https = false;

function app(req, res) {

};

let project_id = process.argv[2];
console.log('Project id: ' + project_id);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Set up the MongoDB connection
var dbPath = process.env.MONGO_DB ?? 'mongodb://127.0.0.1:27017/tilbot';

if (process.env.MONGO_USERNAME != undefined) {
  dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
}

const options = {useNewUrlParser: true, useUnifiedTopology: true};
await mongoose.connect(dbPath, options);

// Main MongoDB connection
console.log('MongoDB connected');

const project = await ProjectModel.findOne({'id': project_id});
if (project === null) {
    console.log('Project not found -- exiting');
    process.exit();
} else {
    // This is just the starting point (non-inclusive) of the port range
    // we'll try to listen on. We'll try to bind higher and higher ports
    // (consecutively) until we find one that's available. This makes
    // the port range a bit more predictable.
    const startPort = parseInt(process.env.LISTEN_PORT ?? (is_https ? '443' : '80')) + 1;

    // Retrieve general user settings for ChatGPT API key and local LLM settings
    // @TODO: also retrieve ChatGPT version setting -- now forced to 4.0
    // NOTE: ChatGPT currently is set up to be a static class, so it takes the last API that it was initiated with, not one API per user/project!

    const settings = await SettingsModel.findOne({'user_id': project.user_id});
    let llm_setting = 'chatgpt';
    if (settings != null) {
      if (settings.llm_setting != null) {
        llm_setting = settings.llm_setting;
      }
      if (llm_setting === 'chatgpt') {
        ChatGPT.init(settings.chatgpt_api_key);
      } else {
        LocalLLM.init(settings.llm_api_address);
      }
    }

    let clients = {};

    function tryNextPort(port, ...listenArgs) {
      if (fs.existsSync(__dirname + '/../certs/privkey.pem') && fs.existsSync(__dirname + '/../certs/pubkey.pem')) {
        const key = fs.readFileSync(__dirname + '/../certs/privkey.pem');
        const cert = fs.readFileSync(__dirname + '/../certs/pubkey.pem');
        var ssloptions = {
          key: key,
          cert: cert
        };

        server = https.createServer(ssloptions, app);
        is_https = true;
      } else {
        server = http.createServer(app);
      }

      server.listen(port, ...listenArgs).on('error', err => {
        if (err.code === 'EADDRINUSE') {
          if (port < 65535) {
            server.close();
            tryNextPort(port + 1, ...listenArgs);
          } else {
            throw new Error("Unable to bind any port");
          }
        } else {
          throw new Error(`Error while binding to port ${port}: ${err.message}`);
        }
      });
    }

    tryNextPort(startPort, () => {
      console.log(`listening on port ${server.address().port} (${is_https ? 'https' : 'http'})`);
      project.socket = server.address().port;
      project.save();
    });

    io.on('connection', (socket) => {
        console.log('a user connected');

        clients[socket.id] = new ProjectController(io, project, socket.id, __dirname + '/../projects/' + project.id, llm_setting);

        socket.on('message sent', () => {
            clients[socket.id].message_sent_event();
        });

        socket.on('user_message', (str) => {
            clients[socket.id].receive_message(str);
        });

        socket.on('disconnect', () => {
            clients[socket.id].disconnected();
            delete clients[socket.id];
            console.log('disconnected');
        });

        socket.on('log', (str) => {
            clients[socket.id].log(str);
        });

        socket.on('pid', (pid) => {
          clients[socket.id].set_participant_id(pid);
        });
    });
}
