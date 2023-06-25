const fs = require('fs');

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

class Logger {

    stream = null;

    constructor(p) {
        if (`${__dirname}`.includes(p)) {
          p += '/../..';
        }

        if (!fs.existsSync(p + '/logs')) {
            fs.mkdirSync(p + '/logs');
        }

        this.stream = fs.createWriteStream(p + "/logs/" + new Date().toFilenameString() + ".csv", {flags: 'a'});
        this.stream.write("timestamp;event;detail\r\n");
        this.log('session_start');
    }


    log(event, detail = '') {
        let timestamp = new Date().toLogString();
        this.stream.write(timestamp + ';' + event + ';' + detail + "\r\n");
    }
}

module.exports = Logger;