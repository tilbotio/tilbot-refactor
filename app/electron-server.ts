import Fastify from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import { randomBytes } from "crypto";
import { dirname, join, resolve } from "path";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { fileURLToPath } from "url";
import LLM from './llm.cjs';
import { LocalProjectController } from "../common/projectcontroller/local.ts";
import { Logger } from "./logger.ts";
import {
  ServerControllerLookup,
  ServerControllerOutput,
} from "../backend/projectcontroller.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

let p = process.argv[2].substring(3);

let project_str = readFileSync(join(p, 'currentproject/electron-project.json'), 'utf8');
let project = JSON.parse(project_str);
console.log(project);

// Load settings
let settings = { chatgpt_api_key: '' };
try {
  settings = JSON.parse(readFileSync(join(p, 'settings.json'), 'utf8'));
} catch (err) {
  if (err.code != 'ENOENT') {
    throw err;
  }
}

const llm = LLM.fromSettings(settings);

const app = Fastify({ });

await Promise.all([
  console.log("it workS!"),

  app.register(fastifyWebSocket),

  app.register(fastifyStatic, {
    root: [
      join(__dirname, '/build'),
      join(p, 'currentproject'),
    ],
  }),

]);

app.get('/', (req, res) => {
  res.status(200);
  res.sendFile(join(__dirname, '/build/index.html'));
});

const projectControllers = new Map();

// API call: create a new conversation for the project.
app.get('/api/create_conversation', async (req, res) => {

  const csv_datas: any = {};

  const projectController = new LocalProjectController(
    new ServerControllerLookup(csv_datas, llm),
    new ServerControllerOutput(),
    new Logger(p),
    project
  );

  const controllerId = randomBytes(16).toString('hex');
  projectControllers.set(controllerId, projectController);
  return { conversation: controllerId, settings: project.settings };
});


app.get("/ws/chat", { websocket: true }, async (socket, req) => {
  console.log("==== socket");
  const query: any = req.query;
  const projectController = projectControllers.get(query.conversation);

  if (!projectController) {
    throw new Error(`Conversation '${query.conversation}' not found`);
  }

  console.log(projectController.output);
  const output = projectController.output;

  if (output.socket) {
    output.socket.close();
    output.socket = null;
  }
  output.socket = socket;

  socket.addEventListener("open", () => {
    if (output.socket) {
      // We're late to the party.
      socket.close();
    } else {
      output.socket = socket;
    }
  });

  socket.addEventListener("close", () => {
    if (output.socket === socket) {
      output.socket = null;
    }
  });

  socket.addEventListener("message", (e: MessageEvent) => {
    try {
      const [command, ...args] = JSON.parse(e.data);
      switch (command) {
        case "message sent":
          projectController.message_sent_event();
          break;

        case "user_message":
          projectController.receive_message(...(args as [string]));
          break;

        case "log":
          projectController.log(...(args as [string]));
          break;

        case "pid":
          projectController.set_participant_id(...(args as [string]));
          break;
      }
    } catch (error) {
      console.error(error);
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
