import type { ProjectControllerLookupInterface } from "../../../../common/projectcontroller/types";

export class ChatLookup implements ProjectControllerLookupInterface {
  private promise!: Promise<string>;
  private pendingResolver: ((value: string) => void) | null = null;
  private windowAPI: any = (window.parent as any)?.api;

  async cell(
    table: string,
    col: string,
    val: string
  ): Promise<Object[] | null> {
    return await this.windowAPI.invoke("get-data-table-cell", {
      tableName: table,
      columnName: col,
      val: val,
    });
  }

  async random(table: string): Promise<any | null> {
    return await this.windowAPI.invoke("get-data-table-random-row", {
      tableName: table,
    });
  }

  async column(table: string, col: string): Promise<any[] | null> {
    return await this.windowAPI.invoke("get-data-table-column", {
      tableName: table,
      columnName: col,
    });
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
