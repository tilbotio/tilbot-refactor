import type { ExternalLink } from "../../../../common/project/types";
import type { ProjectControllerLookupInterface } from "../../../../common/projectcontroller/types";

export class ChatLookup implements ProjectControllerLookupInterface {
  private promise!: Promise<string>;
  private pendingResolver: ((value: string) => void) | null = null;
  private windowAPI: any = (window.parent as any)?.api;

  private getAudioUploadFilename(audioBlob: Blob): string {
    const mimeType = audioBlob.type.toLowerCase();

    if (mimeType.includes("ogg")) {
      return "audio.ogg";
    }

    if (mimeType.includes("webm")) {
      return "audio.webm";
    }

    return "audio.bin";
  }

  private getImageUploadFilename(imageBlob: Blob): string {
    const mimeType = imageBlob.type.toLowerCase();

    if (mimeType.includes("png")) {
      return "image.png";
    }

    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      return "image.jpg";
    }

    return "image.bin";
  }

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

  async column(
    table: string,
    col: string,
    filterCol: string | null = null,
    filterVal: string | null = null
  ): Promise<any[] | null> {
    return await this.windowAPI.invoke("get-data-table-column", {
      tableName: table,
      columnName: col,
      filterCol: filterCol,
      filterVal: filterVal,
    });
  }

  async apiCall(
    external_link: ExternalLink,
    user_input: string | Blob = "",
    connectors: string[] = [],
    extraParams: Record<string, string> = {},
    image?: Blob
  ): Promise<any | null> {
    const headers: Headers = new Headers();
    headers.set("Accept", "application/json");

    let fullUrl = external_link.url;

    if (external_link.url_editor !== null) {
      fullUrl = external_link.url_editor;
    }

    if (fullUrl.indexOf("http://") == -1 && fullUrl.indexOf("https://") == -1) {
      fullUrl = "http://" + fullUrl;
    }

    let data: BodyInit;

    data = new FormData();

    if (user_input instanceof Blob) {
      data.append("audio", user_input, this.getAudioUploadFilename(user_input));
    } else if (user_input !== "") {
      data.append("user_input", user_input);
      data.append("intent_options", JSON.stringify(connectors));
    }

    if (image) {
      data.append("image", image, this.getImageUploadFilename(image));
    }
    
    for (const [key, value] of Object.entries(extraParams)) {
      data.append(key, value);
    }

    const request: RequestInfo = new Request(fullUrl, {
      method: "POST",
      headers: headers,
      body: data,
    });

    return fetch(request)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return Promise.reject(res);
      })
      .then((res) => {
        return res;
      })
      .catch((res) => {
        console.log(res.status, res.statusText);
      });
  }
}
