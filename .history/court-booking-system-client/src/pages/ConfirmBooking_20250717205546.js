import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
];

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Get today's date in YYYY-MM-DD format for min attribute
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({ ...bookingDetails, [name]: value });
  };

  const handleSlotSelect = (field, value) => {
    setBookingDetails({ ...bookingDetails, [field]: value });
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
        setSuccessMessage(`Court "${court.Name}" Booked Successfully!`);
        setShowModal(true);
        setBookingDetails({ name: "", email: "", date: "", startTime: "", endTime: "" });
      } else {
        alert(`Booking failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`An error occurred during booking: ${error.message}`);
    }
  };

  return (
    <div className="confirm-booking-vertical-container">
      {successMessage && (
        <div className="alert alert-success text-center mb-3" style={{ position: "relative", zIndex: 2 }}>
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
            min={getToday()}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Start Time</label>
          <div className="time-slots">
            {timeSlots.map((slot) => (
              <button
                type="button"
                key={slot}
                className={`slot-btn${bookingDetails.startTime === slot ? " selected" : ""}`}
                onClick={() => handleSlotSelect("startTime", slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={bookingDetails.startTime}
            onChange={handleInputChange}
            className="form-control mt-2"
            required
            style={{ maxWidth: 180 }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Time</label>
          <div className="time-slots">
            {timeSlots.map((slot) => (
              <button
                type="button"
                key={slot}
                className={`slot-btn${bookingDetails.endTime === slot ? " selected" : ""}`}
                onClick={() => handleSlotSelect("endTime", slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={bookingDetails.endTime}
            onChange={handleInputChange}
            className="form-control mt-2"
            required
            style={{ maxWidth: 180 }}
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
      {/* Modal for booking confirmation */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h4>Booking Confirmed!</h4>
            <p>{successMessage}</p>
            <button className="btn btn-success" onClick={() => setShowModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;