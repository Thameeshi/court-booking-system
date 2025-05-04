import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ViewCourt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  if (!court) {
    return (
      <div className="container mt-5 text-center">
        <p className="text-danger">No court details found. Please go back and try again.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">{court.Name}</h1>
      <div className="card shadow-lg">
        <div className="row g-0">
          <div className="col-md-5">
            <img
              src={court.Image}
              alt={court.Name}
              className="img-fluid rounded-start"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="col-md-7">
            <div className="card-body">
              <h4 className="card-title">Court Details</h4>
              <hr />
              <p className="card-text">
                <strong>Location:</strong> {court.Location}
              </p>
              <p className="card-text">
                <strong>Type:</strong> {court.Type}
              </p>
              <p className="card-text">
                <strong>Price Per Hour:</strong> ${court.PricePerHour}
              </p>
              <p className="card-text">
                <strong>Availability:</strong> {court.Availability}
              </p>
              <p className="card-text">
                <strong>Contact Email:</strong> <a href={`mailto:${court.Email}`}>{court.Email}</a>
              </p>
              <p className="card-text">
                <strong>Description:</strong> {court.Description || "No description provided."}
              </p>
              <div className="d-flex justify-content-end mt-4">
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