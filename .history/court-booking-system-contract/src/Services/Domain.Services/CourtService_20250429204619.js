// backend/services/domain-services/CourtService.js

import { settings } from "../../settings.json";
import { SqliteDatabase } from "../common-services/dbHandler.js";
import { Tables } from "../../Constants/Tables.js";

export class CourtService {
    #message = null;
    #dbPath = settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
    }

    async addCourt(data) {
        const resObj = { reqId: this.#message.reqId };

        try {
            await this.#dbContext.open();

            const courtEntity = {
                name: data.name,
                location: data.location,
                type: data.type,
                availability: data.availability,
                pricePerHour: data.pricePerHour,
                ownerEmail: data.ownerEmail,
            };

            const rowId = await this.#dbContext.insertValue(Tables.COURT, courtEntity);
            resObj.success = { message: "Court added successfully", rowId };
        } catch (error) {
            console.error("Error in adding court:", error);
            resObj.error = error.message;
        } finally {
            this.#dbContext.close();
        }

        return resObj;
    }

    async editCourt(courtId, updatedData) {
        const resObj = { reqId: this.#message.reqId };

        try {
            await this.#dbContext.open();

            const fields = [];
            const values = [];

            for (const key in updatedData) {
                fields.push(`${key} = ?`);
                values.push(updatedData[key]);
            }
            values.push(courtId);

            const updateQuery = `UPDATE ${Tables.COURT} SET ${fields.join(", ")} WHERE id = ?`;
            const updateResult = await this.#dbContext.runQuery(updateQuery, values);

            resObj.success = updateResult.changes > 0 ? "Court updated successfully." : "No changes made.";
        } catch (error) {
            console.error("Error in editing court:", error);
            resObj.error = error.message;
        } finally {
            this.#dbContext.close();
        }

        return resObj;
    }

    async deleteCourt(courtId) {
        const resObj = { reqId: this.#message.reqId };

        try {
            await this.#dbContext.open();

            const deleteQuery = `DELETE FROM ${Tables.COURT} WHERE id = ?`;
            const result = await this.#dbContext.runQuery(deleteQuery, [courtId]);

            resObj.success = result.changes > 0 ? "Court deleted successfully." : "No court found to delete.";
        } catch (error) {
            console.error("Error in deleting court:", error);
            resObj.error = error.message;
        } finally {
            this.#dbContext.close();
        }

        return resObj;
    }

    async getAllCourts() {
        const resObj = {};

        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables.COURT}`;
            const courts = await this.#dbContext.runSelectQuery(query);

            resObj.success = courts.length > 0 ? courts : null;
        } catch (error) {
            console.error("Error in retrieving all courts:", error);
            resObj.error = error.message;
        } finally {
            this.#dbContext.close();
        }

        return resObj;
    }

    async getCourtsByOwner(ownerEmail) {
        const resObj = {};

        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables.COURT} WHERE ownerEmail = ?`;
            const courts = await this.#dbContext.runSelectQuery(query, [ownerEmail]);

            resObj.success = courts.length > 0 ? courts : null;
        } catch (error) {
            console.error("Error in retrieving owner's courts:", error);
            resObj.error = error.message;
        } finally {
            this.#dbContext.close();
        }

        return resObj;
    }
}
