import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ownerEmail = process.env.USER_EMAIL || 'default@example.com';

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await courtService.getUserBookings(userEmail);

        if (response && Array.isArray(response)) {
          setBookings(response); // Directly set the response as bookings
        } else {
          setError("No bookings found or failed to fetch.");
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
              <h5>{booking.CourtName || `Court ID: ${booking.CourtId}`}</h5>
              <p>Date: {booking.Date}</p>
              <p>Time: {booking.StartTime} - {booking.EndTime}</p>
              <p>Status: {booking.Status}</p>
              <p>Type: {booking.BookingType}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
