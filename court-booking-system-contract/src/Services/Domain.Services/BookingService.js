const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
import { Tables } from "../../Constants/Tables";

export class BookingService {
    #message = null;
    #dbPath = settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
        console.log("BookingService initialized with message and database context");
    }

    async createBooking(data) {
        let resObj = {};
        resObj.reqId = this.#message?.reqId;

        try {
            console.log("Creating booking with data:", data);
            
            // Validate input data
            if (
                !data.UserEmail ||
                !data.CourtId ||
                !data.Date ||
                !data.StartTime ||
                !data.EndTime
            ) {
                throw new Error(
                    "Missing required fields: UserEmail, CourtId, Date, StartTime, or EndTime."
                );
            }

            await this.#dbContext.open();

            // Make sure the court exists
            const courtQuery = `SELECT * FROM ${Tables.COURT} WHERE Id = ?`;
            const courts = await this.#dbContext.runSelectQuery(courtQuery, [data.CourtId]);
            
            if (courts.length === 0) {
                throw new Error(`Court with ID ${data.CourtId} not found.`);
            }

            // Check for booking conflicts
            const conflictQuery = `
                SELECT * FROM ${Tables.BOOKING} 
                WHERE CourtId = ? AND Date = ? AND 
                ((StartTime <= ? AND EndTime >= ?) OR (StartTime <= ? AND EndTime >= ?) OR (StartTime >= ? AND EndTime <= ?))
            `;
            
            const conflictParams = [
                data.CourtId, 
                data.Date, 
                data.StartTime, data.StartTime,  // Case 1: Existing booking starts before and ends during/after requested start
                data.EndTime, data.EndTime,      // Case 2: Existing booking starts during/before and ends after requested end
                data.StartTime, data.EndTime     // Case 3: Existing booking is completely within requested time
            ];
            
            const conflicts = await this.#dbContext.runSelectQuery(conflictQuery, conflictParams);
            
            if (conflicts.length > 0) {
                throw new Error("This court is already booked for the selected time period.");
            }

            // Create booking entity
            const bookingEntity = {
                CourtId: data.CourtId,
                CourtName: data.CourtName || courts[0].Name, // Use court name from data or from DB query
                UserEmail: data.UserEmail,
                UserName: data.UserName || null,
                Date: data.Date,
                StartTime: data.StartTime,
                EndTime: data.EndTime,
                Status: "Pending",  // Default status
                CreatedAt: new Date().toISOString()
            };

            // Insert the booking into the database
            const rowId = await this.#dbContext.insertValue(Tables.BOOKING, bookingEntity);

            resObj.success = { 
                message: "Booking created successfully", 
                bookingId: rowId,
                bookingDetails: { ...bookingEntity, Id: rowId }
            };
            return resObj;
        } catch (error) {
            console.log("Error in creating booking: ", error);
            resObj.error = `Error in creating booking: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async confirmBooking(bookingId) {
        let resObj = {};
        resObj.reqId = this.#message?.reqId;

        try {
            console.log("Confirming booking with ID:", bookingId);
            
            await this.#dbContext.open();

            // Check if booking exists
            const checkQuery = `SELECT * FROM ${Tables.BOOKING} WHERE Id = ?`;
            const bookings = await this.#dbContext.runSelectQuery(checkQuery, [bookingId]);
            
            if (bookings.length === 0) {
                throw new Error(`Booking with ID ${bookingId} not found.`);
            }

            // Update booking status
            const updateQuery = `UPDATE ${Tables.BOOKING} SET Status = 'Confirmed' WHERE Id = ?`;
            const result = await this.#dbContext.runQuery(updateQuery, [bookingId]);

            resObj.success = result.changes > 0 ? 
                { message: "Booking confirmed successfully", bookingId } : 
                { message: "No changes made" };
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
        resObj.reqId = this.#message?.reqId;

        try {
            console.log("Getting bookings for user:", userEmail);
            
            if (!userEmail) {
                throw new Error("User email is required to fetch bookings.");
            }

            await this.#dbContext.open();
            
            // First, check if the BOOKING table exists
            const tableCheckQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='${Tables.BOOKING}'`;
            const tableExists = await this.#dbContext.runSelectQuery(tableCheckQuery);
            
            if (tableExists.length === 0) {
                console.error("BOOKING table does not exist in the database");
                throw new Error("Booking table does not exist. The system might need initialization.");
            }
            
            // Query to get all bookings for a user
            const query = `
                SELECT b.*, c.Name as CourtName, c.Location
                FROM ${Tables.BOOKING} b
                LEFT JOIN ${Tables.COURT} c ON b.CourtId = c.Id
                WHERE b.UserEmail = ?
                ORDER BY b.Date DESC, b.StartTime ASC
            `;
            
            const bookings = await this.#dbContext.runSelectQuery(query, [userEmail]);
            
            console.log(`Found ${bookings.length} bookings for user ${userEmail}`);
            
            resObj.success = bookings;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving user bookings: ", error);
            resObj.error = `Error in retrieving user bookings: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getCourtBookings(courtId) {
        let resObj = {};
        resObj.reqId = this.#message?.reqId;

        try {
            console.log("Getting bookings for court:", courtId);
            
            if (!courtId) {
                throw new Error("Court ID is required to fetch bookings.");
            }

            await this.#dbContext.open();
            
            // Query to get all bookings for a court
            const query = `SELECT * FROM ${Tables.BOOKING} WHERE CourtId = ? ORDER BY Date ASC, StartTime ASC`;
            const bookings = await this.#dbContext.runSelectQuery(query, [courtId]);
            
            console.log(`Found ${bookings.length} bookings for court ${courtId}`);
            
            resObj.success = bookings;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving court bookings: ", error);
            resObj.error = `Error in retrieving court bookings: ${error.message}`;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }
}