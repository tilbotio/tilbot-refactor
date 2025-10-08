import type { ProjectControllerOutputInterface } from "../../../../common/projectcontroller/types";
import type { RuntimeContext } from "$lib/types/RuntimeContext";
import type { ProjectSettings } from "../../../../common/project/types";
import type { Message } from "$lib/types/types";

export class ChatOutput implements ProjectControllerOutputInterface {
  public isTypingIndicatorActive = $state(false);
  public messages = $state<Message[]>([]);
  private settingsContext: ProjectSettings;
  private runtimeContext: RuntimeContext;
  constructor(
    settingsContext: ProjectSettings,
    runtimeContext: RuntimeContext
  ) {
    this.settingsContext = settingsContext;
    this.runtimeContext = runtimeContext;
  }
  typingIndicator(): void {
    this.isTypingIndicatorActive = true;
  }
  windowMessage(text: string): void {}
  // chatbot_message
  botMessage(block: {
    type: string;
    content: string;
    params?: any;
    has_targets?: boolean;
  }): void {
    this.isTypingIndicatorActive = true;

    let timeout = 2000;
    if (this.settingsContext.typing_style == "variable") {
      timeout =
        (block.content.length / this.settingsContext.typing_charpsec) * 1000;
    } else if (this.settingsContext.typing_style == "fixed") {
      timeout = this.settingsContext.typing_time * 1000;
    }

    setTimeout(() => {
      console.log(`Timing is ${timeout}`);
      this.isTypingIndicatorActive = false;
      this.messages.push({ from: "bot", content: block.content });
    }, timeout);
  }

  settings(settings: ProjectSettings, path?: RuntimeContext["path"]): void {
    Object.assign(this.settingsContext, settings);
    if (path) {
      this.runtimeContext.path = path;
    }
  }
}
