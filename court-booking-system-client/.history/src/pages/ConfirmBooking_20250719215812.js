import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/ConfirmBooking.css";

// Helper to convert 12-hour time to 24-hour format
const to24Hour = (hour, minute, ampm) => {
  let h = parseInt(hour, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minute}`;
};

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];
const ampmOptions = ["AM", "PM"];

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
    startHour: "",
    startMinute: "",
    startAMPM: "AM",
    endHour: "",
    endMinute: "",
    endAMPM: "AM",
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Convert to 24-hour time for backend
    const startTime = to24Hour(bookingDetails.startHour, bookingDetails.startMinute, bookingDetails.startAMPM);
    const endTime = to24Hour(bookingDetails.endHour, bookingDetails.endMinute, bookingDetails.endAMPM);

    const payload = {
      CourtId: court.Id,
      CourtName: court.Name,
      UserEmail: bookingDetails.email,
      UserName: bookingDetails.name,
      Date: bookingDetails.date,
      StartTime: startTime,
      EndTime: endTime,
    };

    try {
      const response = await courtService.createBooking(payload);
      if (response && response.success) {
        setSuccessMessage(`Court "${court.Name}" Booked Successfully!`);
        setShowModal(true);
        setBookingDetails({
          name: "",
          email: "",
          date: "",
          startHour: "",
          startMinute: "",
          startAMPM: "AM",
          endHour: "",
          endMinute: "",
          endAMPM: "AM",
        });
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
      <h2 className="confirm-booking-title">{court ? court.Name : "Unknown Court"}</h2>
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
          <div className="time-select-row">
            <select
              name="startHour"
              value={bookingDetails.startHour}
              onChange={handleInputChange}
              className="form-control time-select"
              required
            >
              <option value="">HH</option>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="time-colon">:</span>
            <select
              name="startMinute"
              value={bookingDetails.startMinute}
              onChange={handleInputChange}
              className="form-control time-select"
              required
            >
              <option value="">MM</option>
              {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              name="startAMPM"
              value={bookingDetails.startAMPM}
              onChange={handleInputChange}
              className="form-control time-select ampm"
              required
            >
              {ampmOptions.map(ampm => <option key={ampm} value={ampm}>{ampm}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">End Time</label>
          <div className="time-select-row">
            <select
              name="endHour"
              value={bookingDetails.endHour}
              onChange={handleInputChange}
              className="form-control time-select"
              required
            >
              <option value="">HH</option>
              {hours.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="time-colon">:</span>
            <select
              name="endMinute"
              value={bookingDetails.endMinute}
              onChange={handleInputChange}
              className="form-control time-select"
              required
            >
              <option value="">MM</option>
              {minutes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              name="endAMPM"
              value={bookingDetails.endAMPM}
              onChange={handleInputChange}
              className="form-control time-select ampm"
              required
            >
              {ampmOptions.map(ampm => <option key={ampm} value={ampm}>{ampm}</option>)}
            </select>
          </div>
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
            <button className="btn btn-successs" onClick={() => setShowModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmBooking;