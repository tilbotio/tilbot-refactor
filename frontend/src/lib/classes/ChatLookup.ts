import type { ProjectControllerLookupInterface } from "../../../../common/projectcontroller/types";

export class ChatLookup implements ProjectControllerLookupInterface {
    private promise!: Promise<string>;
    private pendingResolver: ((value: string) => void) | null = null;
  async cell(db: string, col: string, val: string): Promise<Object[] | null> {
    // Not used in the chatinterface
    return null;
  }

  async random(db: string): Promise<Object | null> {
    // Not used in the chatinterface
    return null;
  }

  async variation(
    content: string,
    prompt: string,
    memory: any
  ): Promise<string> {
    window.parent.postMessage({
      msg: "variation",
      content: content,
      prompt: prompt,
      memory: memory,
    });

    this.promise = new Promise((resolve) => {
      this.pendingResolver = resolve;
    });
    return await this.promise;
  }

  resolveVariation(result: string) {
    if (this.pendingResolver) {
        this.pendingResolver(result);
        this.pendingResolver = null;
    }
  }
}