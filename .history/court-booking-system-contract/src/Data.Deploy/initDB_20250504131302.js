import { Tables } from "../Constants/Tables";

const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const settings = require("../settings.json").settings;

export class DBInitializer {
    static #db = null;

    static async init() {
        // Initialize the database connection
        this.#db = new sqlite3.Database(settings.dbPath);

        // Create table User
        await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USER} (
            Id INTEGER,
            XrplAddress TEXT NOT NULL UNIQUE,
            Email TEXT NOT NULL,
            Name TEXT NOT NULL,
            UserRole TEXT NOT NULL,
            Description TEXT,
            Lat REAL,
            Lng REAL,
            PRIMARY KEY("Id" AUTOINCREMENT)
        )`);

        // Create table Court with OwnerID included
        await this.#runQuery(`
            CREATE TABLE IF NOT EXISTS ${Tables.COURT} (
                Id INTEGER,
                Name TEXT NOT NULL,
                Location TEXT NOT NULL,
                Type TEXT NOT NULL,
                PricePerHour REAL NOT NULL,
                Email TEXT NOT NULL,
                Description TEXT,
                Availability TEXT NOT NULL,
                Image TEXT,
                OwnerID INTEGER NOT NULL,
                PRIMARY KEY("Id" AUTOINCREMENT)
            )
        `);

        // const userList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.USER}`);
        // if (userList[0].count === 0) {
        //     // Insert dummy data for Users
        //     await this.#runQuery(`INSERT INTO ${Tables.USER} (XrplAddress, Email, Name, UserRole, Description, Lat, Lng) VALUES 
        //         ('rCourtOwner1', 'owner1@example.com', 'Sports Complex A', 'CourtOwner', 'Owner of multiple courts', 34.0522, -118.2437),
        //         ('rCourtUser1', 'user1@example.com', 'John Doe', 'User', 'Public user who books courts', 40.7128, -74.0060)
        //     `);
        // }

        // Insert dummy data for Courts if none exist
        const courtList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.COURT}`);
        if (courtList[0].count === 0) {
            await this.#runQuery(`INSERT INTO ${Tables.COURT} 
                (Name, Location, Type, PricePerHour, Email, Description, Availability, Image, OwnerID) 
                VALUES 
                ('Badminton Court A', 'Downtown Sports Arena', 'Badminton', 10.00, 'thameeshisenade@gmail.com', 'Indoor court with wooden flooring', 'Available', 'badminton.jpg', 1),
                ('Tennis Court B', 'Uptown Club', 'Tennis', 15.00, 'thameeshisenade@gmail.com', 'Outdoor hard court', 'Booked', 'tennis.jpg', 1),
                ('Futsal Court C', 'City Park', 'Futsal', 20.00, 'thameeshisenade@gmail.com', 'Artificial turf futsal court', 'Available', 'futsal.jpg', 1)
            `);
        }

        // Close the database connection after all queries are executed
        this.#db.close();
    }

    static #runQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.run(query, params ? params : [], function (err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ lastId: this.lastID, changes: this.changes });
            });
        });
    }

    static #runSelectQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.all(query, params ? params : [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
}