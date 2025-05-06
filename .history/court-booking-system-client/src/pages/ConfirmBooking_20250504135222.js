import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  if (!court) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-danger">No court selected for booking. Please go back and try again.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({
      ...bookingDetails,
      [name]: value,
    });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log("Booking Details:", bookingDetails);
    alert(`Court "${court.Name}" booked successfully!`);
    navigate("/"); // Redirect to the home page or another page after booking
  };

  return (
    <div className="container mt-5">
      <h1>Confirm Booking for: {court.Name}</h1>
      <form onSubmit={handleBookingSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={bookingDetails.name}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Your Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={bookingDetails.email}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">Booking Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="time" className="form-label">Booking Time</label>
          <input
            type="time"
            id="time"
            name="time"
            value={bookingDetails.time}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-success">Confirm Booking</button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ConfirmBooking;