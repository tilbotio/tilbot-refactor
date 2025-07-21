import { LogModel } from "./db/log.ts";
import { MessageModel } from "./db/message.ts";
import type { ProjectControllerLoggerInterface } from "../common/projectcontroller/types.ts";

export class Logger implements ProjectControllerLoggerInterface {
  private _log: any;

  constructor(project_id: string) {
    this._log = new LogModel();
    this._log.project_id = project_id;
    this._log.save((err: any) => {
      if (err) {
        console.log("Logging error initial_save");
      }
    });
  }

  log(event: string, detail = "") {
    if (event == "message_bot" || event == "message_user") {
      const msg = new MessageModel();
      msg.source = "bot";
      if (event == "message_user") {
        msg.source = "user";
      }
      msg.message = detail;
      this._log.messages.push(msg);
      this._log.save((err: any) => {
        if (err) {
          console.log("Logging error message");
        }
      });
    } else if (event == "session_end") {
      this._log.session_closed = new Date();
      this._log.save((err: any) => {
        if (err) {
          console.log("Logging error session_end");
        }
      });
    }
  }

  set_participant_id(pid: string) {
    this._log.participant_id = pid;
    this._log.save((err: any) => {
      if (err) {
        console.log("Logging error participant_id");
      }
    });
  }
}
