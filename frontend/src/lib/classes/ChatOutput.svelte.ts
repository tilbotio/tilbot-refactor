import type {
  ProjectControllerOutputInterface,
  ProjectControllerInterface,
} from "../../../../common/projectcontroller/types";
import type { RuntimeContext } from "$lib/types/RuntimeContext";
import type { ProjectSettings } from "../../../../common/project/types";
import type { Message } from "$lib/types/types";

export class ChatOutput implements ProjectControllerOutputInterface {
  private settingsContext: ProjectSettings;
  private runtimeContext: RuntimeContext;
  public projectController?: ProjectControllerInterface<ChatOutput>;

  public isTypingIndicatorActive = $state(false);
  public messages = $state<Message[]>([]);

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

  windowMessage(text: string): void {
    if (window.self !== window.top) {
      window.parent.postMessage(text);
    }
  }

  botMessage(block: {
    type: string;
    content: string;
    params?: any;
    has_targets?: boolean;
  }): void {
    this.isTypingIndicatorActive = true;

    const currentSettings = this.settingsContext;
    const typingStyle = currentSettings.typing_style;

    let timeout = 2000;
    if (typingStyle === "variable") {
      timeout = (block.content.length / currentSettings.typing_charpsec) * 1000;
    } else if (typingStyle === "fixed") {
      timeout = currentSettings.typing_time * 1000;
    }

    setTimeout(() => {
      this.isTypingIndicatorActive = false;
      this.processMessage("bot", block.content, null);
    }, timeout);
  }

  settings(settings: ProjectSettings, path?: RuntimeContext["path"]): void {
    Object.assign(this.settingsContext, settings);
    for (const key in this.settingsContext) {
      if (!(key in settings)) {
        delete (this.settingsContext as any)[key];
      }
    }
    if (path) {
      this.runtimeContext.path = path;
    }
  }

  addMessageToMessagesArray(
    from: Message["from"],
    content: Message["content"],
    params?: Message["params"]
  ) {
    this.messages.push({ from: from, content: content, params: params });
  }

  processMessage(
    from: Message["from"],
    content: Message["content"],
    params?: Message["params"]
  ) {
    this.addMessageToMessagesArray(from, content, params);
    if (from == "bot") {
      this.projectController?.message_sent_event();
    } else {
      this.projectController?.receive_message(content);
    }
  }
}
