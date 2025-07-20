import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

// ConfirmBooking component
const ConfirmBooking = () => {
  // Hooks for navigation and location
  const navigate = useNavigate();
  const location = useLocation();

  // Get court details and any success message from navigation state
  const { court } = location.state || {};
  const successMessage = location.state?.successMessage;

  // State for booking form fields
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  // Handle form submission for booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Prepare booking payload
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
      // Call booking service
      const response = await courtService.createBooking(payload);

      // On success, redirect to MyBookings with a success message
      if (response && response.success) {
        navigate("/userdashboard/myBookings", { state: { successMessage: `Court "${court.Name}" booked successfully!` } });
      } else {
        alert(`Booking failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      // Handle errors
      console.error("Booking error:", error);
      alert(`An error occurred during booking: ${error.message}`);
    }

    // Reset form fields
    setBookingDetails({ name: "", email: "", date: "", startTime: "", endTime: "" });
  };

  // Render booking form
  return (
    <div className="container mt-5">
      {/* Show success message if present */}
      {successMessage && (
        <div className="alert alert-success text-center mb-3">
          {successMessage}
        </div>
      )}
      <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
      <form onSubmit={handleBookingSubmit} autoComplete="off">
        {/* Name input */}
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
        {/* Email input */}
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
        {/* Date input */}
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
        {/* Start time input */}
        <div className="mb-3">
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
        {/* End time input */}
        <div className="mb-3">
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
        {/* Action buttons */}
        <div className="d-flex gap-3 mt-2 justify-content-center">
          <button
            type="submit"
            className="btn btn-success"
            style={{
              fontSize: "0.95rem",
              color: "#fff",
              fontWeight: 600,
              padding: "10px 28px",
              minWidth: "130px"
            }}
          >
            Confirm Booking
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              padding: "10px 28px",
              minWidth: "130px"
            }}
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