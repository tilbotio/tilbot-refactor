import type { ProjectControllerOutputInterface } from "../../../../common/projectcontroller/types";

export class ChatOutput implements ProjectControllerOutputInterface {
  public isTypingIndicatorActive = $state(false);
  typingIndicator(): void {
    this.isTypingIndicatorActive = true;
  }
  windowMessage(text: string): void {}
  // chatbot_message
  botMessage(block: {
    type: string;
    content: string;
    params: any;
    has_targets?: boolean;
  }): void {}
  settings(settings: any, path?: string): void {}
}
