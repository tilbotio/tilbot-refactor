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
}
