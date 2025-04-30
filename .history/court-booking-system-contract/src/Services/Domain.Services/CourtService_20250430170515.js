const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
import { Tables } from "../../Constants/Tables";

export class CourtService {
    #message = null;
    #dbPath = settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
    }

    async addCourt(data) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            // Validate input data
            if (!data.name || !data.description || !data.price || !data.ownerEmail || !data.nfTokenID || !data.nfTokenSellOffer) {
                throw new Error("Missing required fields: name, description, price, ownerEmail, nfTokenID, or nfTokenSellOffer.");
            }

            await this.#dbContext.open();

            // Populate courtEntity with the provided data
            const courtEntity = {
                name: data.name,
                description: data.description,
                price: data.price,
                ownerEmail: data.ownerEmail,
                nfTokenID: data.nfTokenID,
                nfTokenSellOffer: data.nfTokenSellOffer,
            };

            // Insert the courtEntity into the database
            const rowId = await this.#dbContext.insertValue(Tables.COURT, courtEntity);

            resObj.success = { message: "Court added successfully", rowId: rowId };
            return resObj;
        } catch (error) {
            console.log("Error in adding court: ", error);
            resObj.error = `Error in adding court: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async editCourt(courtId, updatedData) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            await this.#dbContext.open();

            let fields = [];
            let values = [];

            for (let key in updatedData) {
                fields.push(`${key} = ?`);
                values.push(updatedData[key]);
            }
            values.push(courtId);

            const updateQuery = `UPDATE ${Tables.COURT} SET ${fields.join(", ")} WHERE Id = ?`;
            const updateResult = await this.#dbContext.runQuery(updateQuery, values);

            resObj.success = updateResult.changes > 0 ? "Court updated successfully." : "No changes made.";
            return resObj;
        } catch (error) {
            console.log("Error in editing court: ", error);
            resObj.error = `Error in editing court: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async deleteCourt(courtId) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            await this.#dbContext.open();

            const deleteQuery = `DELETE FROM ${Tables.COURT} WHERE Id = ?`;
            const result = await this.#dbContext.runQuery(deleteQuery, [courtId]);

            resObj.success = result.changes > 0 ? "Court deleted successfully." : "No court found to delete.";
            return resObj;
        } catch (error) {
            console.log("Error in deleting court: ", error);
            resObj.error = `Error in deleting court: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getAllCourts() {
        let resObj = {};
        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables.COURT}`;
            const courts = await this.#dbContext.runSelectQuery(query);

            resObj.success = courts.length > 0 ? courts : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving courts: ", error);
            resObj.error = `Error in retrieving courts: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getCourtsByOwner(ownerEmail) {
        let resObj = {};
        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables.COURT} WHERE ownerEmail = ?`;
            const courts = await this.#dbContext.runSelectQuery(query, [ownerEmail]);

            resObj.success = courts.length > 0 ? courts : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving owner's courts: ", error);
            resObj.error = `Error in retrieving owner's courts: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }
}