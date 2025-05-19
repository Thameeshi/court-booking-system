import { SharedService } from "./SharedService";

const sqlite3 = require("sqlite3").verbose();
const path = require("path"); // Ensure proper handling of file paths

const DataTypes = {
    TEXT: "TEXT",
    INTEGER: "INTEGER",
    NULL: "NULL",
};

class SqliteDatabase {
    constructor(dbFile) {
        // Use path.resolve to ensure cross-platform compatibility for file paths
        this.dbFile = path.resolve(dbFile);
        this.openConnections = 0;
    }

    open() {
        if (this.openConnections <= 0) {
            this.db = new sqlite3.Database(this.dbFile, (err) => {
                if (err) {
                    console.error("Error opening database:", err.message);
                } else {
                    console.log("Connected to SQLite database.");
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
                    console.log("Database connection closed.");
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

    isTableExists(tableName) {
        const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`;
        return new Promise((resolve, reject) => {
            this.db.all(query, [], function (err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(!!(rows.length && rows.length > 0));
            });
        });
    }

    getValues(tableName, filter = null, op = "=") {
        if (!this.db) throw "Database connection is not open.";

        let values = [];
        let filterStr = "";
        if (filter) {
            const columnNames = Object.keys(filter);

            if (op === "IN") {
                for (const columnName of columnNames) {
                    if (filter[columnName].length > 0) {
                        filterStr += `${columnName} ${op} ( `;

                        const valArray = filter[columnName];
                        for (const v of valArray) {
                            filterStr += `?, `;
                            values.push(v);
                        }

                        filterStr = filterStr.slice(0, -2);
                        filterStr += `) AND `;
                    }
                }
            } else {
                for (const columnName of columnNames) {
                    filterStr += `${columnName} ${op} ? AND `;
                    values.push(filter[columnName] ? filter[columnName] : "NULL");
                }
            }
        }
        filterStr = filterStr.slice(0, -5);

        const query =
            `SELECT * FROM ${tableName}` + (filterStr ? ` WHERE ${filterStr};` : ";");
        console.log("Query: " + query);
        return new Promise((resolve, reject) => {
            let rows = [];
            this.db.each(
                query,
                values,
                function (err, row) {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }

                    rows.push(row);
                },
                function (err, count) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });
    }

    async runSelectQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    console.error("Error running query:", err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getLastRecord(tableName) {
        const query = `SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT 1`;
        return new Promise((resolve, reject) => {
            this.db.get(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err.message);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async insertValue(tableName, value) {
        return await this.insertValues(tableName, [value]);
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

    async deleteValues(tableName, filter = null) {
        if (!this.db) throw "Database connection is not open.";

        let values = [];
        let filterStr = "1 AND ";
        if (filter) {
            const columnNames = Object.keys(filter);
            for (const columnName of columnNames) {
                filterStr += `${columnName} = ? AND `;
                values.push(filter[columnName] ? filter[columnName] : "NULL");
            }
        }
        filterStr = filterStr.slice(0, -5);

        const query = `DELETE FROM ${tableName} WHERE ${filterStr};`;
        return await this.runQuery(query, values);
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

    async findById(tableName, id) {
        if (!this.db) throw "Database connection is not open.";

        const query = `SELECT * FROM ${tableName} WHERE Id = ${id}`;
        return new Promise((resolve, reject) => {
            this.db.get(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err.message);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async insertRowsIntoTable(tableName, rowDataArray) {
        const insertStatement = `INSERT INTO ${tableName} VALUES (${rowDataArray
            .map(() => "?")
            .join(", ")})`;

        this.db.serialize(() => {
            const stmt = this.db.prepare(insertStatement);

            rowDataArray.forEach((rowData) => {
                stmt.run(rowData, (err) => {
                    if (err) {
                        console.error("Error inserting row:", err.message);
                    }
                });
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error("Error finalizing statement:", err.message);
                }
            });
        });
    }
}

export default {
    SqliteDatabase,
    DataTypes,
};
