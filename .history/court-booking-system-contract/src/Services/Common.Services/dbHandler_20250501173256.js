import { SharedService } from "./SharedService";
const sqlite3 = require("sqlite3").verbose();

const DataTypes = {
    TEXT: "TEXT",
    INTEGER: "INTEGER",
    NULL: "NULL",
};

class SqliteDatabase {
    constructor(dbFile) {
        this.dbFile = dbFile || "./data/database.db"; // Default database file path
        this.openConnections = 0;
    }

    open() {
        if (this.openConnections <= 0) {
            this.db = new sqlite3.Database(this.dbFile, (err) => {
                if (err) {
                    console.error("Error opening database:", err.message);
                } else {
                    console.log("Connected to the SQLite database.");
                }
            });
            this.openConnections = 1;
        } else {
            this.openConnections++;
        }
    }

    close() {
        if (this.openConnections <= 1) {
            this.db.close((err) => {
                if (err) {
                    console.error("Error closing database:", err.message);
                } else {
                    console.log("Closed the SQLite database connection.");
                }
            });
            this.db = null;
            this.openConnections = 0;
        } else {
            this.openConnections--;
        }
    }

    async createTableIfNotExists(tableName, columnInfo) {
        if (!this.db) throw "Database connection is not open.";

        const columns = columnInfo
            .map((c) => {
                let info = `${c.name} ${c.type}`;
                if (c.default) info += ` DEFAULT ${c.default}`;
                if (c.unique) info += " UNIQUE";
                if (c.primary) info += " PRIMARY KEY";
                if (c.notNull) info += " NOT NULL";
                return info;
            })
            .join(", ");

        const query = `CREATE TABLE IF NOT EXISTS ${tableName}(${columns})`;
        await this.runQuery(query);
    }

    async insertValues(tableName, values) {
        if (!this.db) throw "Database connection is not open.";
        if (values.length) {
            const columnNames = Object.keys(values[0]);

            let rowValueStr = "";
            let rowValues = [];
            for (const val of values) {
                rowValueStr += "(";
                for (const columnName of columnNames) {
                    rowValueStr += "?,";
                    rowValues.push(val[columnName] ?? "NULL");
                }
                rowValueStr = rowValueStr.slice(0, -1) + "),";
            }
            rowValueStr = rowValueStr.slice(0, -1);

            const query = `INSERT INTO ${tableName}(${columnNames.join(
                ", "
            )}) VALUES ${rowValueStr}`;
            console.log("====================================================>");
            console.log("Query: ", query);
            console.log("rowValues: ", rowValues);
            console.log("====================================================>");
            return await this.runQuery(query, rowValues);
        }
    }

    runQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params ? params : [], function (err) {
                if (err) {
                    reject(err);
                }
                resolve({ lastId: this.lastID, changes: this.changes });
            });
        });
    }
}

export default {
    SqliteDatabase,
    DataTypes,
};