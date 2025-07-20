import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ViewCourt.css";

const ViewCourt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  if (!court) {
    return (
      <div className="viewcourt-container">
        <div className="alert alert-warning mt-5 text-center">
          No court details found. Please go back and try again.
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    navigate("/payment", { state: { court } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="viewcourt-container">
      <div className="viewcourt-card">
        {/* Title above the image */}
        <h2
          className="viewcourt-title"
          style={{
            color: "#12822e",
            fontSize: "1.45rem",
            fontWeight: 700,
            margin: "22px 0 8px 0",
            textAlign: "center",
            letterSpacing: "0.5px"
          }}
        >
          {court.Name}
        </h2>
        <div className="viewcourt-img-section">
          <img
            src={court.Image}
            alt={court.Name}
            className="viewcourt-img"
          />
          <div className="viewcourt-details-section">
            <div className="viewcourt-details-list">
              <p><span role="img" aria-label="location">📍</span> <strong>Location:</strong> {court.Location}</p>
              <p><span role="img" aria-label="type">🏷️</span> <strong>Type:</strong> {court.Type}</p>
              <p><span role="img" aria-label="price">💲</span> <strong>Price Per Hour:</strong> <span className="price-highlight">${court.PricePerHour}</span></p>
              <p><span role="img" aria-label="calendar">📅</span> <strong>Available Date:</strong> {formatDate(court.AvailableDate)}</p>
              <p><span role="img" aria-label="clock">⏰</span> <strong>Available Hours:</strong> {court.AvailableStartTime || "Not specified"} - {court.AvailableEndTime || "Not specified"}</p>
              <p><span role="img" aria-label="email">✉️</span> <strong>Contact Email:</strong> <a href={`mailto:${court.Email}`}>{court.Email}</a></p>
              <p><span role="img" aria-label="info">ℹ️</span> <strong>Description:</strong> {court.Description || "No description provided."}</p>
            </div>
            <div className="viewcourt-actions">
              <button className="btn btn-success prominent" onClick={handlePayment}>
                Pay Now
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourt;