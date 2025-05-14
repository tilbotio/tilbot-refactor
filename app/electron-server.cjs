const Fastify = require('fastify');
const fastifyWebSocket = require('fastify-websocket');
const fastifyStatic = require('@fastify/static');
const path = require('path');
const fs = require('fs');
const LLM = require('./llm.cjs');
const ProjectController = require('./projectcontroller.cjs');

let p = process.argv[2].substring(3);

let project = fs.readFileSync(path.join(p, 'currentproject/electron-project.json'));
project = JSON.parse(project);
console.log(project);

// Load settings
let settings = { chatgpt_api_key: '' };
try {
  settings = JSON.parse(fs.readFileSync(path.join(p, 'settings.json', 'utf8')));
} catch (err) {
  if (err.code != 'ENOENT') {
    throw err;
  }
}

const llm = LLM.fromSettings(settings);

let https = null;
try {
  https = {
    key: fs.readFileSync(path.join(__dirname, '../certs/privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/pubkey.pem')),
  };
} catch {
  if (err.code != 'ENOENT') {
    throw err;
  }
}

const app = Fastify({ https });
await app.register(fastifyWebSocket);

await app.register(fastifyStatic, {
  root: [
    path.join(__dirname, '../build'),
    path.join(p, 'currentproject'),
  ],
});

app.get('/', (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

const projectControllers = new Map();

// API call: create a new conversation for the project.
app.get('/api/create_conversation', async (req, res) => {
  const projectController = new ProjectController(project, p, llm);
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

app.listen({ port: 2801, host: '0.0.0.0' }, (err, addr) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  } else {
    console.log(`listening on ${addr}`);
  }
});
