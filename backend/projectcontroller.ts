// Helper classes to wire up the common ProjectController for use in the
// server.

import type { ExternalLink } from "../common/project/types.ts";
import type {
  ProjectControllerLookupInterface,
  ProjectControllerOutputInterface,
} from "../common/projectcontroller/types";
import { VariableDb } from "../common/variabledb.ts";

export class ServerControllerLookup
  implements ProjectControllerLookupInterface
{
  private db: VariableDb;
  private isElectron: boolean;

  constructor(db: VariableDb, isElectron: boolean = false) {
    this.db = db;
    this.isElectron = isElectron;
  }

  async cell(
    table: string,
    col: string,
    val: string
  ): Promise<Object[] | null> {
    let res = this.db.getCell(table, col, val);
    return res;
  }

  async random(table: string): Promise<any | null> {
    let res = this.db.getRandomRow(table);
    return res;
  }

  async column(table: string, col: string): Promise<any[] | null> {
    let res = this.db.getColumn(table, col);
    return res;
  }

  async apiCall(
    external_link: ExternalLink,
    user_input: string = "",
    connectors: string[] = []
  ): Promise<any> {
    // Code is almost identical to the simulator version in ChatLookup.ts
    // @TODO: see if this can be merged...

    // We can use the `Headers` constructor to create headers
    // and assign it as the type of the `headers` variable
    const headers: Headers = new Headers();
    // Add a few headers
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    let fullUrl = external_link.url;

    if (external_link.url_editor !== null && this.isElectron) {
      fullUrl = external_link.url_editor;
    }

    if (fullUrl.indexOf("http://") == -1 && fullUrl.indexOf("https://") == -1) {
      fullUrl = "http://" + fullUrl;
    }

    let params = {};

    if (user_input !== "") {
      params.user_input = user_input;
    }
    if (connectors.length > 0) {
      params.intent_options = connectors;
    }

    if (user_input !== "" || connectors.length > 0) {
      fullUrl += "?" + new URLSearchParams(params).toString();
    }

    console.log(external_link);
    console.log(user_input);
    console.log(connectors);

    console.log(fullUrl);

    // Create the request object, which will be a RequestInfo type.
    // Here, we will pass in the URL as well as the options object as parameters.
    const request: RequestInfo = new Request(fullUrl, {
      method: "GET",
      headers: headers,
    });

    try {
      // For our example, the data is stored on a static `users.json` file
      return (
        fetch(request)
          // the JSON body is taken from the response
          .then((res) => res.json())
          .then((res) => {
            return res;
          })
      );
    } catch {
      return null;
    }
  }
}

export class ServerControllerOutput
  implements ProjectControllerOutputInterface
{
  private _socket: WebSocket | null = null;
  private pending: any[] = [];

  emit(...message: any[]) {
    this.pending.push(JSON.stringify(message));
    this.flushSocket();
  }

  flushSocket() {
    const socket = this._socket;
    if (socket != null) {
      const pending = this.pending;
      for (const p of this.pending) {
        socket.send(p);
      }
      pending.length = 0;
    }
  }

  get socket() {
    return this._socket;
  }

  set socket(socket: WebSocket | null) {
    this._socket = socket;
    if (socket == null) {
      return;
    }

    this.flushSocket();

    socket.addEventListener("close", () => {
      if (this._socket === socket) {
        this._socket = null;
      }
    });
  }

  typingIndicator(): void {
    this.emit("typing indicator");
  }

  windowMessage(text: string): void {
    this.emit("window message", { content: text });
  }

  botMessage(block: {
    type: string;
    content: string;
    params: any;
    has_targets?: boolean;
  }): void {
    this.emit("bot message", block);
  }

  settings(settings: any, path?: string): void {
    this.emit("settings", settings, path);
  }
}
