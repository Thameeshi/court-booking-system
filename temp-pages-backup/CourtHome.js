import React from "react";
import { useNavigate } from "react-router-dom";

const CourtHome = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "#f8f9fa", // Off-white background
      }}
    >
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1
            className="fw-bold"
            style={{ color: "#1a237e", fontSize: "2.8rem", letterSpacing: "1px" }}
          >
            Welcome, Court Owner!
          </h1>
          <p className="lead" style={{ color: "#333", fontSize: "1.25rem" }}>
            Effortlessly manage your courts, bookings, and profile from your personalized dashboard.
          </p>
        </div>
        <div className="row justify-content-center mb-4">
          <div className="col-md-4 mb-3">
            <button
              className="btn btn-primary btn-lg w-100 shadow-sm"
              style={{ borderRadius: "1rem" }}
              onClick={() => navigate("/dashboard/myCourts")}
            >
              <i className="bi bi-collection me-2"></i>
              Manage My Courts
            </button>
          </div>
          <div className="col-md-4 mb-3">
            <button
              className="btn btn-success btn-lg w-100 shadow-sm"
              style={{ borderRadius: "1rem" }}
              onClick={() => navigate("/dashboard/court")}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New Court
            </button>
          </div>
          <div className="col-md-4 mb-3">
            <button
              className="btn btn-secondary btn-lg w-100 shadow-sm"
              style={{ borderRadius: "1rem" }}
              onClick={() => navigate("/dashboard/profile")}
            >
              <i className="bi bi-person-circle me-2"></i>
              My Profile
            </button>
          </div>
        </div>
        <div className="bg-white rounded p-4 shadow-sm mx-auto" style={{ maxWidth: 700 }}>
          <h5 className="fw-semibold mb-3" style={{ color: "#1a237e" }}>
            Quick Tips
          </h5>
          <ul className="mb-0" style={{ fontSize: "1.08rem", color: "#444" }}>
            <li>
              <strong>Manage My Courts:</strong> View, edit, or remove your courts at any time.
            </li>
            <li>
              <strong>Add New Court:</strong> Easily list a new court for booking.
            </li>
            <li>
              <strong>My Profile:</strong> Keep your details updated for better visibility and trust.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourtHome;