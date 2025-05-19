import React from "react";
import { useNavigate } from "react-router-dom";

const CourtHome = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Welcome, Court Owner!</h1>
      <p className="lead">
        Manage your courts, view bookings, and keep your court information up to date.
      </p>
      <div className="d-flex flex-wrap gap-3 mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard/myCourts")}
        >
          Manage My Courts
        </button>
        <button
          className="btn btn-success"
          onClick={() => navigate("/dashboard/court")}
        >
          Add New Court
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/dashboard/profile")}
        >
          My Profile
        </button>
      </div>
      <div className="mt-5">
        <h4>Quick Tips:</h4>
        <ul>
          <li>Click "Manage My Courts" to edit or delete your courts.</li>
          <li>Use "Add New Court" to list a new court for booking.</li>
          <li>Keep your profile updated for better visibility.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourtHome;