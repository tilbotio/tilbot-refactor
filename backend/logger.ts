import { LogModel } from "./db/log.ts";
import { MessageModel } from "./db/message.ts";
import type { ProjectControllerLoggerInterface } from "../common/projectcontroller/types.ts";

export class Logger implements ProjectControllerLoggerInterface {
  private _log: any;
  private _saveQueue: Promise<void> = Promise.resolve();

  constructor(project_id: string) {
    this._log = new LogModel();
    this._log.project_id = project_id;
    this._log.session_started = new Date();
    this._enqueueSave(() => {}, "initial_save");
  }

  private _enqueueSave(update: () => void, event: string) {
    this._saveQueue = this._saveQueue
      .then(async () => {
        update();
        await this._log.save();
      })
      .catch((err: any) => {
        console.log(`Logging error ${event}`);
        console.log(err);
      });
  }

  log(event: string, detail = "") {
    console.log("Loggging event: " + event + " detail: " + detail);
    if (event == "message_bot" || event == "message_user") {
      const msg = new MessageModel();
      msg.source = "bot";
      if (event == "message_user") {
        msg.source = "user";
      }
      msg.message = detail;
      this._enqueueSave(() => this._log.messages.push(msg), "message");
    } else if (event == "session_end") {
      this._enqueueSave(() => (this._log.session_closed = new Date()), event);
    }
  }

  set_participant_id(pid: string) {
    this._enqueueSave(() => (this._log.participant_id = pid), "participant_id");
  }
}
