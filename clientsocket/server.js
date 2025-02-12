import http from 'http';
import https from 'https';
import {Server} from 'socket.io';
import path from 'path';
import fs from 'fs';
import ProjectController from '../electron/projectcontroller.cjs';
import ChatGPT from '../electron/chatgpt.cjs';
import LocalLLM from '../electron/localllm.cjs';
import { ProjectSchema } from '../db/project.js';
import { SettingsSchema } from '../db/settings.js';
import { mongoose } from 'mongoose';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

var server = null;
let is_https = false;

function app(req, res) {

};

if (fs.existsSync(__dirname + '/../certs/privkey.pem') && fs.existsSync(__dirname + '/../certs/pubkey.pem')) {

  const key = fs.readFileSync(__dirname + '/../certs/privkey.pem');
  const cert = fs.readFileSync(__dirname + '/../certs/pubkey.pem');
  var ssloptions = {
    key: key,
    cert: cert
  };

  server = https.createServer(ssloptions, app);
  is_https = true;
}

else {
  server = http.createServer(app);
}

let project_id = process.argv[2];
console.log('Project id: ' + project_id);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Set up the MongoDB connection
var dbPath = 'mongodb://127.0.0.1:27017/tilbot';

if (process.env.MONGO_USERNAME != undefined) {
  dbPath = 'mongodb://' + process.env.MONGO_USERNAME + ':' + process.env.MONGO_PASSWORD + '@mongo:' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB;
}

const options = {useNewUrlParser: true, useUnifiedTopology: true};
const mongo = mongoose.connect(dbPath, options);

// Main MongoDB connection
mongo.then(() => {
  console.log('MongoDB connected');

  const ProjectDetails = mongoose.model('projectschemas', ProjectSchema);

  ProjectDetails.findOne({'id': project_id}).then(function(project) {
    if (project === null) {
        console.log('Project not found -- exiting');
        process.exit();
    }
    else {
        let port = 0;

        let llm_setting = 'chatgpt';

        // Retrieve general user settings for ChatGPT API key and local LLM settings
        // @TODO: also retrieve ChatGPT version setting -- now forced to 4.0
        // NOTE: ChatGPT currently is set up to be a static class, so it takes the last API that it was initiated with, not one API per user/project!
        const SettingsDetails = mongoose.model('settingsschemas', SettingsSchema);

        SettingsDetails.findOne({'user_id': project.user_id}).then(function(settings) {

          llm_setting = settings.llm_setting;

          if (settings !== null && settings.llm_setting == 'chatgpt') {
            ChatGPT.init(settings.chatgpt_api_key);
          }

          if (settings !== null && settings.llm_setting !== 'chatgpt') {
            LocalLLM.init(settings.llm_api_address);
          }
        });

        let clients = {};

        server.listen(port, () => {
            console.log('listening on port ' + server.address().port + (is_https?' (https)':' (http)'));
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

  });

});
