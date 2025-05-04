import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

const ViewCourt = () => {
  const { courtId } = useParams(); // Get courtId from the route
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourtDetails = async () => {
      try {
        setLoading(true);
        const response = await courtService.getCourtById(courtId); // Fetch court details by ID
        if (response.success) {
          setCourt(response.success);
        } else {
          setError("Failed to fetch court details.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching court details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourtDetails();
  }, [courtId]);

  if (loading) {
    return <div className="container mt-5"><p>Loading court details...</p></div>;
  }

  if (error) {
    return <div className="container mt-5"><p className="text-danger">{error}</p></div>;
  }

  if (!court) {
    return <div className="container mt-5"><p>No court details found.</p></div>;
  }

  return (
    <div className="container mt-5">
      <h1>{court.Name}</h1>
      <div className="row">
        <div className="col-md-6">
          <img
            src={court.Image} // Assuming `Image` contains the image URL
            alt={court.Name}
            className="img-fluid rounded"
            style={{ height: "300px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-6">
          <h3>Details</h3>
          <p><strong>Location:</strong> {court.Location}</p>
          <p><strong>Type:</strong> {court.Type}</p>
          <p><strong>Price Per Hour:</strong> ${court.PricePerHour}</p>
          <p><strong>Availability:</strong> {court.Availability}</p>
          <p><strong>Description:</strong> {court.Description}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCourt;