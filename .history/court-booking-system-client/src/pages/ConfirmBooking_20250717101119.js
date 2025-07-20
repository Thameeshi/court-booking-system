import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};
  const successMessage = location.state?.successMessage;

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
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
      UserName: bookingDetails.name,
      Date: bookingDetails.date,
      StartTime: bookingDetails.startTime,
      EndTime: bookingDetails.endTime,
    };
    try {
      const response = await courtService.createBooking(payload);
      if (response && response.success) {
        navigate("/userdashboard/myBookings", { state: { successMessage: `Court "${court.Name}" booked successfully!` } });
      } else {
        alert(`Booking failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`An error occurred during booking: ${error.message}`);
    }
    setBookingDetails({ name: "", email: "", date: "", startTime: "", endTime: "" });
  };

  return (
    <div className="confirm-booking-vertical-container">
      {successMessage && (
        <div className="alert alert-success text-center mb-3">
          {successMessage}
        </div>
      )}
      <h2 className="confirm-booking-title">Book Court: {court ? court.Name : "Unknown Court"}</h2>
      <form onSubmit={handleBookingSubmit} autoComplete="off" className="confirm-booking-form">
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="startTime" className="form-label">Start Time</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={bookingDetails.startTime}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endTime" className="form-label">End Time</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={bookingDetails.endTime}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-success"
          >
            Confirm Booking
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmBooking;