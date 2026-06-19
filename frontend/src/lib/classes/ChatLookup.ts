import type { ExternalLink } from "../../../../common/project/types";
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

  async apiCall(
    external_link: ExternalLink,
    user_input: string = "",
    connectors: string[] = []
  ): Promise<any | null> {
    // We can use the `Headers` constructor to create headers
    // and assign it as the type of the `headers` variable
    const headers: Headers = new Headers();
    // Add a few headers
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    let fullUrl = external_link.url;

    if (external_link.url_editor !== null) {
      fullUrl = external_link.url_editor;
    }

    if (fullUrl.indexOf("http://") == -1 && fullUrl.indexOf("https://") == -1) {
      fullUrl = "http://" + fullUrl;
    }

    let params = {};

    if (user_input !== "") {
      params.user_input = user_input;
    }
    if (connectors.length > 0) {
      params.intent_options = connectors;
    }

    if (user_input !== "" || connectors.length > 0) {
      fullUrl += "?" + new URLSearchParams(params).toString();
    }

    // Create the request object, which will be a RequestInfo type.
    // Here, we will pass in the URL as well as the options object as parameters.
    const request: RequestInfo = new Request(fullUrl, {
      method: "GET",
      headers: headers,
    });

    try {
      // For our example, the data is stored on a static `users.json` file
      return (
        fetch(request)
          // the JSON body is taken from the response
          .then((res) => res.json())
          .then((res) => {
            return res;
          })
      );
    } catch {
      return null;
    }
  }
}
