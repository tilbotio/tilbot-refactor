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

  set controller(controller: ProjectControllerInterface<ChatOutput>) {
    this.projectController = controller;
  }

  get controller(): ProjectControllerInterface<ChatOutput> | undefined {
    return this.projectController;
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

    let timeout = 2000;
    if (this.settingsContext.typing_style === "variable") {
      timeout =
        (block.content.length / this.settingsContext.typing_charpsec) * 1000;
    } else if (this.settingsContext.typing_style === "fixed") {
      timeout = this.settingsContext.typing_time * 1000;
    }

    setTimeout(() => {
      this.isTypingIndicatorActive = false;
      this.messages.push({ from: "bot", content: block.content });
      this.projectController?.message_sent_event();
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
}
