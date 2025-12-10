import type { ProjectControllerLoggerInterface } from "../../../../common/projectcontroller/types";

export class ChatLogger implements ProjectControllerLoggerInterface {
  log(event: string, detail: string): void {
    // Not in use at the moment  
  }
  set_participant_id(pid: string): void {
    // Not in use at the moment
  }
}
