//const fs = require('fs');
const LineByLine = require('n-readlines');
const csvdb = require('csv-database');

class CsvData {

    db = null;

    constructor(filename) {
        // Retrieve the columns from the first row of the CSV file
        let csvfile = new LineByLine(`${__dirname}/../currentproject/var/` + filename);
        let firstline = csvfile.next();
        let firstlineutf = firstline.toString('utf8').replace("\r", "").replace(/[\u0000-\u001F\u007F-\u009F\u200B\u200C\uFEFF]/g, "");
        let cols = firstlineutf.split(';');

        // Set up the CSV database
        let self = this;
        csvdb(`${__dirname}/../currentproject/var/` + filename, cols, ";").then(function(db) {
            self.db = db;
        });
    }

    async get(col, val) {
        if (this.db !== null) {
            let param = {};
            param[col] = val;
            let res = await this.db.get(param);
            return res;
        }
        else {
            return null;
        }
    }

}

module.exports = CsvData;