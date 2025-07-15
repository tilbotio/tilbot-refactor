import LineByLine from 'n-readlines';
import csvdb from 'csv-database';

export class CsvData {
    private db: ReturnType<typeof csvdb>; // This is a Promise

    constructor(filename: string, p: string) {
        // Retrieve the columns from the first row of the CSV file
        const fullPath = `${p}/var/${filename}`;
        const csvfile = new LineByLine(fullPath);
        const firstline = csvfile.next();
        const firstlineutf = firstline.toString('utf8').replace("\r", "").replace(/[\u0000-\u001F\u007F-\u009F\u200B\u200C\uFEFF]/g, "");
        const cols = firstlineutf.split(';');

        // Set up the CSV database (this will continue in the background):
        this.db = csvdb(fullPath, cols, ";");
    }

    async get(col: string, val: string): Promise<Object[]> {
        const db = await this.db;
        return await db.get({[col]: val});
    }

    async get_random_line(): Promise<Object> {
        const db = await this.db;
        const allLines = await db.get();
        return allLines[Math.floor(Math.random() * allLines.length)];
    }
}
