import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewCourt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  if (!court) {
    return <p>No court details found. Please go back and try again.</p>;
  }

<<<<<<< HEAD
=======
  const handlePayment = () => {
    // Navigate to a payment page or trigger a payment process
    navigate("/payment", { state: { court } });
  };

>>>>>>> 1f1e6f51ba62a1cfa0abd0381d6d20cbc454e21c
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
              <p><strong>Contact Email:</strong> {court.Email}</p>
              <p><strong>Description:</strong> {court.Description || "No description provided."}</p>

<<<<<<< HEAD
              <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
                Go Back
              </button>
=======
              <button className="btn btn-secondary mt-3 me-2" onClick={() => navigate(-1)}>
                Go Back
              </button>
              <button className="btn btn-primary mt-3" onClick={handlePayment}>
                Pay Now
              </button>
>>>>>>> 1f1e6f51ba62a1cfa0abd0381d6d20cbc454e21c
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ViewCourt;
=======
export default ViewCourt;
>>>>>>> 1f1e6f51ba62a1cfa0abd0381d6d20cbc454e21c
