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
            Email TEXT NOT NULL UNIQUE,
            Name TEXT NOT NULL,
            UserRole TEXT NOT NULL,
            Description TEXT,
            Lat REAL,
            Lng REAL,
            PRIMARY KEY("Id" AUTOINCREMENT)
        )`);

        // Create table DonationRequest
        await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.DONATIONREQUEST} (
            Id INTEGER,
            Name TEXT NOT NULL,
            Description TEXT NOT NULL,
            Amount REAL NOT NULL,
            FoodReceiverID INTEGER NOT NULL,
            NFTokenID TEXT NOT NULL,
            NFTokenSellOffer TEXT NOT NULL,
            DonorID INTEGER,
            PRIMARY KEY("Id" AUTOINCREMENT)
        )`);

        // const userList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.USER}`);
        // if (userList[0].count === 0) {
        //     // Insert dummy data for Users
        //     await this.#runQuery(`INSERT INTO ${Tables.USER} (XrplAddress, Email, Name, UserRole, Description, Lat, Lng) VALUES 
        //         ('rFoodRecipient1', 'recipient1@example.com', 'Homeless Shelter A', 'FoodRecipient', 'Shelter for homeless individuals', 34.0522, -118.2437),
        //         ('rFoodRecipient2', 'recipient2@example.com', 'Disaster Relief Center B', 'FoodRecipient', 'Center for disaster relief efforts', 40.7128, -74.0060),
        //         ('rDonor1', 'donor1@example.com', 'Government A', 'Donor', 'Government organization funding food redistribution', 51.5074, -0.1278),
        //         ('rDonor2', 'donor2@example.com', 'NGO B', 'Donor', 'Non-governmental organization supporting food security', 48.8566, 2.3522),
        //         ('rFoodProvider1', 'provider1@example.com', 'Hotel X', 'FoodProvider', 'Hotel with surplus food', 37.7749, -122.4194),
        //         ('rFoodProvider2', 'provider2@example.com', 'Supermarket Y', 'FoodProvider', 'Supermarket with surplus food', 35.6895, 139.6917),
        //         ('rCommercialRecipient1', 'commercial1@example.com', 'Animal Farm A', 'FoodRecipient', 'Animal farm using expired food', 33.8688, 151.2093),
        //         ('rCommercialRecipient2', 'commercial2@example.com', 'Agriculture Farm B', 'FoodRecipient', 'Agriculture farm using expired food', 52.5200, 13.4050)
        //     `);
        // }

        // const donationRequestList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.DONATIONREQUEST}`);
        // if (donationRequestList[0].count === 0) {
        //     // Insert dummy data for DonationRequest
        //     await this.#runQuery(`INSERT INTO ${Tables.DONATIONREQUEST} (Name, Description, Amount, FoodReceiverID, NFTokenID, NFTokenSellOffer, DonorID) VALUES 
        //         ('Food Donation for Homeless Shelter A', 'Request for food donation to support homeless individuals', 500.00, 1, 'NFT12345', 'SELL_OFFER_12345', 2),
        //         ('Food Donation for Disaster Relief Center B', 'Request for food donation to support disaster relief efforts', 1000.00, 2, 'NFT67890', 'SELL_OFFER_67890', 3),
        //         ('Food Donation for Animal Farm A', 'Request for food donation to support animal farm', 300.00, 7, 'NFT54321', 'SELL_OFFER_54321', NULL),
        //         ('Food Donation for Agriculture Farm B', 'Request for food donation to support agriculture farm', 700.00, 8, 'NFT09876', 'SELL_OFFER_09876', NULL)
        //     `);
        // }

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