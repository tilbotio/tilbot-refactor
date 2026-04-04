import { DatabaseSync } from "node:sqlite";

export class VariableDb {
    private db: DatabaseSync;

    constructor(dbFile: string) {
        this.db = new DatabaseSync(dbFile);
    }

    public delete(tableName: string) {
        const q = `DROP TABLE IF EXISTS "${tableName}";`;
        this.db.exec(q);
    }

    public save(tableName: string, data: any[][]) {
        // Currently we just drop the old version and import the new one.
        this.delete(tableName);

        let q = `CREATE TABLE "${tableName}" (`;
        let baseQ = `INSERT INTO "${tableName}" (`;
        let valuesQ = `) VALUES (`;

        // Create the table based on the first row.
        for (let i = 0; i < data[0].length; i++) {
            // Check data type.
            let dataType = "TEXT";

            if (!isNaN(Number(data[1][i]))) {
                dataType = "INTEGER";
            }

            q += `
                "${data[0][i]}" ${dataType}`;

            baseQ += `"${data[0][i]}"`
            valuesQ += `?`;

            if (i < data[0].length-1) {
                q += `,`;
                baseQ += `, `;
                valuesQ += `, `;
            }
        }

        q += `);`;

        baseQ += valuesQ + `);`;
        
        this.db.exec(q);

        const prep = this.db.prepare(baseQ);

        // Insert the rest of the data
        for (let i = 1; i < data.length; i++) {
            prep.run(...data[i]);
        }
    }

    public getCol(table: string, query: string): any[] {
        return [null];
    }

    public getCell(table: string, col: string, query: string): any {

    }

    public getRandomRow(): any[] {
        return [null];
    }

    public close() {
        this.db.close();
    }
}
