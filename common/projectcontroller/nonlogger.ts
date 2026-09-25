import type { ProjectControllerLoggerInterface } from "./types";

/**
 * A logger that does nothing, used when logging is disabled and for the simulator.
 */
export class NonLogger implements ProjectControllerLoggerInterface {
  log(event: string, detail: string): void {
    // Do nothing!  
  }
  set_participant_id(pid: string): void {
    // Do nothing!
  }
}
