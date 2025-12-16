import type { ProjectControllerLoggerInterface } from "../../../../common/projectcontroller/types";

export class ChatLogger implements ProjectControllerLoggerInterface {
  log(event: string, detail: string): void {
    // Not used in the chatinterface version of the local projectcontroller  
  }
  set_participant_id(pid: string): void {
    // Not in use at the moment
  }
}
