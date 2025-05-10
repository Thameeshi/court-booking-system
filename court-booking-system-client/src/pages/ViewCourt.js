import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewCourt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  if (!court) {
    return <p>No court details found. Please go back and try again.</p>;
  }

  const handlePayment = () => {
    // Navigate to a payment page or trigger a payment process
    navigate("/payment", { state: { court } });
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mt-5">
      <h2>{court.Name}</h2>
      <div className="card">
        <div className="row g-0">
          <div className="col-md-4">
            <img
              src={court.Image}
              alt={court.Name}
              className="img-fluid rounded-start"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <p><strong>Location:</strong> {court.Location}</p>
              <p><strong>Type:</strong> {court.Type}</p>
              <p><strong>Price Per Hour:</strong> ${court.PricePerHour}</p>
              <p><strong>Availability:</strong> {court.Availability}</p>
              
              {/* Added the new fields */}
              <p><strong>Available Date:</strong> {formatDate(court.AvailableDate)}</p>
              <p>
                <strong>Available Hours:</strong> {court.AvailableStartTime || "Not specified"} - {court.AvailableEndTime || "Not specified"}
              </p>
              
              <p><strong>Contact Email:</strong> {court.Email}</p>
              <p><strong>Description:</strong> {court.Description || "No description provided."}</p>

              <div className="mt-4">
                <button className="btn btn-primary me-2" onClick={handlePayment}>
                  Book Now
                </button>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourt;