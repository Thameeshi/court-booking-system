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
      SELECT
        c.Name AS courtName,
        COUNT(b.Id) AS bookings,
        b.UserEmail,
        b.Date,
        b.StartTime,
        b.EndTime
      FROM COURT c
      LEFT JOIN bookings b ON c.Id = b.CourtId
      GROUP BY c.Id, b.UserEmail, b.Date, b.StartTime, b.EndTime
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
        // map rows to proper data shape if needed
        const mappedRows = rows.map((row) => ({
          courtName: row.courtName,
          bookings: Number(row.bookings) || 0,
          userEmail: row.UserEmail,
          date: row.Date,
          startTime: row.StartTime,
          endTime: row.EndTime,
        }));

<<<<<<< HEAD
        resolve({
          reqId: this.message?.reqId,
          success: mappedRows,
        });
=======
    async createBooking(newBooking) {
        return new Promise(async (resolve, reject) => {
            const { UserEmail, CourtId, Date, StartTime, EndTime } = newBooking;

            if (!UserEmail || !CourtId || !Date || !StartTime || !EndTime) {
                return reject(new Error("Missing booking fields"));
            }

            try {
                const existingBookings = await this.getCourtBookingsByDate(CourtId, Date);

                // Check for overlap
                const isOverlapping = existingBookings.some(booking =>
                    StartTime < booking.EndTime && EndTime > booking.StartTime
                );

                if (isOverlapping) {
                    return reject(new Error("This time slot is already booked."));
                }

                // No overlap found — insert booking
                const insertQuery = `
                    INSERT INTO bookings (UserEmail, CourtId, Date, StartTime, EndTime, Status)
                    VALUES (?, ?, ?, ?, ?, 'Pending')
                `;
                this.#db.run(
                    insertQuery,
                    [UserEmail, CourtId, Date, StartTime, EndTime],
                    function (insertErr) {
                        if (insertErr) {
                            console.error("Error inserting booking:", insertErr.message);
                            reject(insertErr);
                        } else {
                            resolve({
                                success: true,
                                bookingId: this.lastID
                            });
                        }
                    }
                );
            } catch (err) {
                console.error("Error during booking creation:", err.message);
                reject(err);
            }
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
  async cancelBooking(bookingId, reason) {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE bookings
      SET Status = 'Cancelled', CancellationReason = ?
      WHERE Id = ? AND Status IN ('Active', 'Pending', 'Confirmed')
    `;

    this.#db.run(updateQuery, [reason, bookingId], function (err) {
      if (err) {
        console.error("Error cancelling booking:", err.message);
        reject(err);
      } else if (this.changes === 0) {
        resolve({ success: false, message: "No cancellable booking found for this booking ID." });
      } else {
        resolve({ success: true, message: "Booking cancelled successfully." });
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
      }
    });
  });
}
<<<<<<< HEAD
}
=======



    async getCourtBookingsByDate(courtId, date) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT b.*, c.Name AS CourtName
                FROM bookings b
                LEFT JOIN COURT c ON b.CourtId = c.Id
                WHERE b.CourtId = ? AND b.Date = ?
                ORDER BY b.StartTime ASC
            `;
            this.#db.all(query, [courtId, date], (err, rows) => {
                if (err) {
                    console.error("Error fetching court bookings by date:", err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
