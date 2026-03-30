import type {
  ProjectControllerInterface,
  ProjectControllerOutputInterface,
} from "./types";

class RemoteProjectController<
  ProjectControllerOutputType extends ProjectControllerOutputInterface
> implements ProjectControllerInterface<ProjectControllerOutputType>
{
  private _output: ProjectControllerOutputType;
  private _pending: string[] = [];
  private _socket: any = null;

  constructor(output: ProjectControllerOutputType) {
    this._output = output;
  }

  emit(...message: any[]) {
    this._pending.push(JSON.stringify(message));
    this.flushSocket();
  }

  flushSocket() {
    const socket = this._socket;
    if (socket != null) {
      const pending = this._pending;
      for (const p of this._pending) {
        socket.send(p);
      }
      pending.length = 0;
    }
  }

  get socket() {
    return this._socket;
  }

  get output(): ProjectControllerOutputType {
    return this._output;
  }

  set socket(socket: any) {
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

    socket.addEventListener("message", (e: MessageEvent) => {
      const [command, ...args] = JSON.parse(e.data);
      switch (command) {
        case "bot message":
          this._output.botMessage(...(args as [any]));
          break;

        case "window message":
          this._output.windowMessage(...(args as [any]));
          break;

        case "settings":
          this._output.settings(...(args as [any, string]));
          break;

        case "typing indicator":
          this._output.typingIndicator();
          break;
      }
    });
  }

  message_sent_event() {
    this._socket.send(JSON.stringify(["message sent"]));
  }

  receive_message(str: string) {
    this._socket.send(JSON.stringify(["user_message", str]));
  }

  log(str: string) {
    this._socket.send(JSON.stringify(["log", str]));
  }

  set_participant_id(pid: string) {
    this._socket.send(JSON.stringify(["pid", pid]));
  }
}

export { RemoteProjectController };
