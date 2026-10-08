import fs from "fs";

// Source: https://stackoverflow.com/questions/18554360/toisostring-return-wrong-date
(function() {

    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    Date.prototype.toFilenameString = function() {
      return pad(this.getDate()) +
        '-' + pad(this.getMonth() + 1) +
        '-' + this.getFullYear() +
        '-' + pad(this.getHours()) +
        '-' + pad(this.getMinutes()) +
        '-' + pad(this.getSeconds()) +
        '-' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
    };

    Date.prototype.toLogString = function() {
      return pad(this.getDate()) +
        '-' + pad(this.getMonth() + 1) +
        '-' + this.getFullYear() +
        ' ' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        ':' + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5);
    };

  })();

export class Logger {

    private stream: any = null;
    private logFileName: string = null;
    private p: string = null;

    constructor(p) {
        if (p.includes('resources')) {
          p += '/../..';
        }

        this.p = p;

        if (!fs.existsSync(p + '/logs')) {
            fs.mkdirSync(p + '/logs');
        }

        this.logFileName = new Date().toFilenameString();

        this.stream = fs.createWriteStream(p + "/logs/" + this.logFileName + ".csv", {flags: 'a'});
        this.stream.write("timestamp;event;detail\r\n");
        this.log('session_start');

        const packageVersion = (globalThis as {
            process?: { env?: Record<string, string | undefined> }
        }).process?.env?.npm_package_version;

        this.log('version', packageVersion || 'unknown');
    }


    log(event, detail = '') {
        let timestamp = new Date().toLogString();
        this.stream.write(timestamp + ';' + event + ';' + detail + "\r\n");
    }

    set_participant_id(pid) {
      let timestamp = new Date().toLogString();
      this.stream.write(timestamp + ';participant_id;' + pid + "\r\n");
    }

    async log_audio(audio: Blob) {
      let timestamp = new Date().toLogString();
      let filename = new Date().toFilenameString() + ".wav";
      let filePath = this.p + '/logs/' + this.logFileName;

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
      }

      fs.writeFileSync(filePath + '/' + filename, Buffer.from(await audio.arrayBuffer()));
      this.log('message_user', this.logFileName + '/' + filename);
    }
}