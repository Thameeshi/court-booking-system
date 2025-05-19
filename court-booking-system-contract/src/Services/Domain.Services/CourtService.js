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
            // Validate the required fields
            if (
                !data.Name ||
                !data.Location ||
                !data.Type ||
                !data.PricePerHour ||
                !data.Email ||
                !data.Availability
            ) {
                throw new Error(
                    "Missing required fields: Name, Location, Type, PricePerHour, Email, or Availability."
                );
            }

            await this.#dbContext.open();

            // Fetch OwnerID from User table using the provided email
            const ownerQuery = `SELECT Id FROM ${Tables.USER} WHERE Email = ?`;
            const ownerResult = await this.#dbContext.runSelectQuery(ownerQuery, [data.Email]);

            console.log("Owner query result:", ownerResult); // Debug log

            if (!ownerResult || ownerResult.length === 0) {
                throw new Error(`No user found with email: ${data.Email}. User must exist before adding a court.`);
            }

            const ownerId = ownerResult[0].Id;

            // Verify ownerId exists and is not undefined/null
            if (!ownerId) {
                throw new Error(`User found with email ${data.Email}, but has no valid ID.`);
            }

            // Build the court entity with all necessary fields including new fields
            const courtEntity = {
                Name: data.Name,
                Location: data.Location,
                Type: data.Type,
                PricePerHour: data.PricePerHour,
                Email: data.Email,
                description: data.description || null,
                Availability: data.Availability,
                Image: data.Image || null,
                OwnerID: ownerId,
                AvailableDate: data.AvailableDate || null,
                AvailableStartTime: data.AvailableStartTime || null,
                AvailableEndTime: data.AvailableEndTime || null,
            };

            // Raw insert query to add court
            const insertQuery = `INSERT INTO ${Tables.COURT} 
            (Name, Location, Type, PricePerHour, Email, description, Availability, Image, OwnerID, AvailableDate, AvailableStartTime, AvailableEndTime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const rowValues = [
                courtEntity.Name,
                courtEntity.Location,
                courtEntity.Type,
                courtEntity.PricePerHour,
                courtEntity.Email,
                courtEntity.description,
                courtEntity.Availability,
                courtEntity.Image,
                courtEntity.OwnerID,
                courtEntity.AvailableDate,
                courtEntity.AvailableStartTime,
                courtEntity.AvailableEndTime,
            ];

           
            console.log("Insert Query: ", insertQuery);
            console.log("Values: ", rowValues);

            const result = await this.#dbContext.runQuery(insertQuery, rowValues);

            resObj.success = { message: "Court added successfully", changes: result.changes };
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

    async getCourtByOwner(email) {
        if (!email) {
            throw new Error("Email is required to fetch courts.");
        }

        const query = `SELECT * FROM ${Tables.COURT} WHERE Email = ?`;
        try {
            await this.#dbContext.open(); // Ensure the database connection is open
            const courts = await this.#dbContext.runSelectQuery(query, [email]);
            if (courts.length === 0) {
                return { success: null, message: "No courts found for the provided email." };
            }
            return { success: courts };
        } catch (error) {
            console.error("Error fetching courts:", error.message);
            return { success: null, message: "An error occurred while fetching courts." };
        } finally {
            this.#dbContext.close(); // Ensure the database connection is closed
        }
    }
}
