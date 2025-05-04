const settings = require("../../settings.json").settings;
import { SqliteDatabase } from "../Common.Services/dbHandler";
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
        resObj.reqId = this.#message.reqId;

        try {
            if (!data.UserEmail || !data.CourtId || !data.Date || !data.StartTime || !data.EndTime) {
                resObj.error = "Missing required fields: UserEmail, CourtId, Date, StartTime, or EndTime.";
                return resObj;
            }

            await this.#dbContext.open();

            const bookingEntity = {
                UserEmail: data.UserEmail,
                CourtId: data.CourtId,
                Date: data.Date,
                StartTime: data.StartTime,
                EndTime: data.EndTime,
                Status: 'Pending',
            };

            console.log("Booking entity to insert:", bookingEntity);

            const rowId = await this.#dbContext.insertValue(Tables.BOOKINGS, bookingEntity);
            console.log("Inserted booking row ID:", rowId);

            resObj.success = { message: "Booking created successfully", rowId: rowId };
            return resObj;
        } catch (error) {
            console.log("Error in creating booking:", error);
            resObj.error = "An error occurred while creating the booking. Please try again later.";
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async confirmBooking(bookingId) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            await this.#dbContext.open();

            const updateQuery = `UPDATE ${Tables.BOOKINGS} SET Status = 'Confirmed' WHERE Id = ?`;
            const result = await this.#dbContext.runQuery(updateQuery, [bookingId]);

            resObj.success = result.changes > 0 ? "Booking confirmed successfully." : "No booking found to confirm.";
            return resObj;
        } catch (error) {
            console.log("Error in confirming booking: ", error);
            resObj.error = `Error in confirming booking: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getUserBookings(userEmail) {
        let resObj = {};
        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables.BOOKINGS} WHERE UserEmail = ?`;
            const bookings = await this.#dbContext.runSelectQuery(query, [userEmail]);

            resObj.success = bookings.length > 0 ? bookings : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving user's bookings: ", error);
            resObj.error = `Error in retrieving user's bookings: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }
}
