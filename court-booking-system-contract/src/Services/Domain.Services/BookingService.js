const sqlite3 = require("sqlite3").verbose();
const settings = require("../../settings.json").settings;

export class BookingService {
  #db;
  message;

  constructor(message) {
    this.message = message;
    this.#db = new sqlite3.Database(settings.dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to SQLite database.");
      }
    });
  }

  async createBooking(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO bookings (UserEmail, CourtId, Date, StartTime, EndTime, Status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
      `;

      const { UserEmail, CourtId, Date, StartTime, EndTime } = data;

      if (!UserEmail || !CourtId || !Date || !StartTime || !EndTime) {
        return reject(new Error("Missing booking fields"));
      }

      this.#db.run(query, [UserEmail, CourtId, Date, StartTime, EndTime], function (err) {
        if (err) {
          console.error("Error inserting booking:", err.message);
          reject(err);
        } else {
          resolve({
            success: true,
            bookingId: this.lastID,
          });
        }
      });
    });
  }

  async getUserBookings(userEmail) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, c.Name AS CourtName
        FROM bookings b
        LEFT JOIN COURT c ON b.CourtId = c.Id
        WHERE b.UserEmail = ?
        ORDER BY b.Date DESC, b.StartTime ASC
      `;

      this.#db.all(query, [userEmail], (err, rows) => {
        if (err) {
          console.error("Error fetching bookings:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getCourtBookingStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.Name AS courtName, COUNT(b.Id) AS bookings
        FROM COURT c
        LEFT JOIN bookings b ON c.Id = b.CourtId
        GROUP BY c.Id
        ORDER BY bookings DESC
      `;

      this.#db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Error fetching booking stats:", err.message);
          reject({
            error: "Error fetching booking statistics.",
            details: err.message,
          });
        } else {
          const mappedRows = rows.map((row) => ({
            courtName: row.courtName,
            bookings: Number(row.bookings) || 0,
          }));

          console.log("[BookingService] Booking stats:", mappedRows);

          resolve({
            reqId: this.message?.reqId,
            success: mappedRows,
          });
        }
      });
    });
  }

  // You can add other methods here if needed
}
