// Various helper functions used throughout the project
export function firstLetter(str: string): string {
  return str.charAt(0).toUpperCase();
}

export function setOrDelete(obj: any, key: string | number, value: any) {
  if (value === undefined) {
    delete obj[key];
  } else {
    obj[key] = value;
  }
}

export function playingTimeToMinSecString(recordingTime: number): string {
    let fullSeconds = Math.round(recordingTime);

    let mins = Math.floor(fullSeconds / 60);
    let remainingSeconds = fullSeconds - mins * 60;

    let minsStr = mins.toString();
    if (minsStr.length == 1) {
        minsStr = "0" + minsStr;
    }
    let secsStr = remainingSeconds.toString();
    if (secsStr.length == 1) {
        secsStr = "0" + secsStr;
    }

    return minsStr + ":" + secsStr;
}  

export function testConnection(url: string, isEditor: boolean = false): Promise<{url: string, ok: boolean, isEditor: boolean}> {
  let linkfull = url;
  
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    linkfull = "http://" + url;
  }
  
  return fetch(linkfull + "/healthcheck", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          console.log(
            `External link health check failed for ${url}: ${response.status} ${response.statusText}`
          );
        }
        return { url, ok: response.ok, isEditor };
      })
      .catch((error) => {
        console.log(
          `External link health check failed for ${url}: ${error}`
        );
        return { url, ok: false, isEditor };
      });
}
