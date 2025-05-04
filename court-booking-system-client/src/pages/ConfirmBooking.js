import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import hotPocketService from "../services/common-services/HotPocketService";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserEmail: bookingDetails.email,
      Date: bookingDetails.date,
      StartTime: bookingDetails.time,
      EndTime: bookingDetails.time, // optional or you can calculate +1hr
    };
    console.log("Payload being sent:", payload);

    try {
      const response = await hotPocketService.getServerInputResponse({
        type: "Court",
        subType: "createBooking",
        data: payload,
      });

      if (response && response.success) {
        alert(`Court "${court.Name}" booked successfully!`);
        navigate("/");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred during booking.");
    }

    setBookingDetails({ name: "", email: "", date: "", time: "" });
  };

  return (
    <div className="container mt-5">
      <h2>Book Court: {court.Name}</h2>
      <form onSubmit={handleBookingSubmit}>
        {/* Inputs same as before */}
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
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ConfirmBooking;
