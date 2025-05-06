import React, { useEffect, useState } from "react";
import hotPocketService from "../services/common-services/HotPocketService";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userEmail = "thameeshisenade@gmail.com"; // Replace this with actual logged-in user's email

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await hotPocketService.getServerReadReqResponse({
          type: "Court",
          subType: "getUserBookings",
          data: { UserEmail: userEmail },
        });

        if (response && response.success) {
          setBookings(response.success);
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
              <h5>{booking.CourtName}</h5>
              <p>{booking.Date}</p>
              <p>{booking.StartTime} - {booking.EndTime}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
