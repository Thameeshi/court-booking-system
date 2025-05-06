import React, { useEffect, useState } from "react";
import bookingService from "../services/domain-services/BookingService";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getMyBookings();
        if (response.success) {
          setBookings(response.success);
        } else {
          setError("Failed to fetch bookings.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="container mt-5">
      <h1>My Bookings</h1>
      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && bookings.length === 0 && <p>No bookings found.</p>}
      {!loading && bookings.length > 0 && (
        <ul className="list-group">
          {bookings.map((booking) => (
            <li key={booking.Id} className="list-group-item">
              <h5>{booking.CourtName}</h5>
              <p>{booking.Date}</p>
              <p>{booking.Time}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;