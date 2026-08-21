import type {
  ProjectControllerInterface,
  ProjectControllerOutputInterface,
  ReceivedMessage
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

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
          this._output.windowMessage(args[0], args[1] as {});
          break;

        case "settings":
          this._output.settings(...(args as [any, string]));
          break;

        case "update message":
          this._output.updateMessage(args[0]);
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

  async receive_message(message: ReceivedMessage) {
    console.log("receive message! " + message.type + " " + message.content.toString());
    if (message.type === "audio") {
      let base64audio = await this.blobToBase64(message.content as Blob);
      message.content = base64audio;
    }
    this._socket.send(JSON.stringify(["user_message", message]));
  }

  log(str: string) {
    this._socket.send(JSON.stringify(["log", str]));
  }

  set_participant_id(pid: string) {
    this._socket.send(JSON.stringify(["pid", pid]));
  }
}

export { RemoteProjectController };
