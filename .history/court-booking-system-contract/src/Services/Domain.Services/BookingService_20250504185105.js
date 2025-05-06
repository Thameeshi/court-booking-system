const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler"); // Fixed import
import { Tables } from "../../Constants/Tables";

export class BookingService {
    #message = null;
    #dbPath = settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
    }

    async createBooking(data) {
        let resObj = {};
        resObj.reqId = this.#message?.reqId;

        try {
            if (!data.UserEmail || !data.CourtId || !data.Date || !data.StartTime || !data.EndTime) {
                throw new Error("Missing required fields: UserEmail, CourtId, Date, StartTime, or EndTime.");
            }

            await this.#dbContext.open();

            const courtQuery = `SELECT * FROM ${Tables.COURT} WHERE Id = ?`;
            const courts = await this.#dbContext.runSelectQuery(courtQuery, [data.CourtId]);

            if (courts.length === 0) {
                throw new Error(`Court with ID ${data.CourtId} not found.`);
            }

            const conflictQuery = `
                SELECT * FROM ${Tables.BOOKING} 
                WHERE CourtId = ? AND Date = ? AND 
                ((StartTime <= ? AND EndTime >= ?) OR (StartTime <= ? AND EndTime >= ?) OR (StartTime >= ? AND EndTime <= ?))
            `;
            const conflictParams = [
                data.CourtId,
                data.Date,
                data.StartTime, data.StartTime,
                data.EndTime, data.EndTime,
                data.StartTime, data.EndTime
            ];
            const conflicts = await this.#dbContext.runSelectQuery(conflictQuery, conflictParams);

            if (conflicts.length > 0) {
                throw new Error("This court is already booked for the selected time period.");
            }

            const bookingEntity = {
                CourtId: data.CourtId,
                CourtName: data.CourtName,
                UserEmail: data.UserEmail,
                UserName: data.UserName || null,
                Date: data.Date,
                StartTime: data.StartTime,
                EndTime: data.EndTime,
                Status: "Pending",
                CreatedAt: new Date().toISOString()
            };

            const rowId = await this.#dbContext.insertValue(Tables.BOOKING, bookingEntity);

            resObj.success = {
                message: "Booking created successfully",
                bookingId: rowId,
                bookingDetails: { ...bookingEntity, Id: rowId }
            };
            return resObj;
        } catch (error) {
            console.error("Error in creating booking:", error);
            resObj.error = `Error in creating booking: ${error.message}`;
            return resObj;
        } finally {
            if (this.#dbContext) {
                this.#dbContext.close();
            }
        }
    }

    // Other methods remain unchanged...
}