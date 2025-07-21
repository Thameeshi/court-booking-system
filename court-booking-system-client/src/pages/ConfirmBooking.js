import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import { useSelector } from "react-redux";
import "../styles/ConfirmBooking.css";

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { court } = location.state || {};

  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [offerId, setOfferId] = useState("");
   const { provider } = useSelector((state) => state.auth);

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
      UserName: bookingDetails.name, // Adding name to payload
      Date: bookingDetails.date,
      StartTime: bookingDetails.startTime,
      EndTime: bookingDetails.endTime,
    };
    console.log("Payload being sent:", payload);

    try {
      // Use courtService's createBooking method instead of directly using hotPocketService
      const response = await courtService.createBooking(payload);

      if (response && response.success) {
        alert(`Court "${court.Name}" booked successfully!`);
        navigate("/");
      } else {
        alert(`Booking failed: ${response.error || "Please try again."}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(`An error occurred during booking: ${error.message}`);
    }

    setBookingDetails({ name: "", email: "", date: "", startTime: "", endTime: "" });
  };

  const handleBuySellOffer = async () => {
      if (!offerId) {
        alert("Please enter a valid Offer ID");
        return;
      }
  
      try {
        const rpc = new XrplService(provider);
        const result = await rpc.acceptSellOffer(offerId);
        console.log(`Offer bought:`,result);
        alert("offer bought!");
        setOfferId("");
      } catch (error) {
        console.error("Error buying offer:", error);
      }
    };
  


  return (
    <div className="container mt-5">
      <h2>Book Court: {court ? court.Name : "Unknown Court"}</h2>
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
        <div className="mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Sell Offer ID"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleBuySellOffer} style={{
              width:"100%",
              padding: "3px",
              fontSize: "14px"
            }}>
              Confirm Booking
            </button>
          </div>

        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ConfirmBooking;