import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CourtBooking.css";
import Footer from "../components/Footer";

// CourtBooking page component
const CourtBooking = () => {
  // State for courts, loading, and error
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch courts on component mount
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await courtService.getAllCourts();
        if (response.success) {
          setCourts(response.success); // Set courts if fetch is successful
        } else {
          setError("Failed to fetch courts."); // Set error if fetch fails
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching courts."); // Handle fetch error
      } finally {
        setLoading(false); // Always stop loading
      }
    };

    fetchCourts();
  }, []);

  // Navigate to view court details
  const handleView = (court) => {
    navigate("/viewcourt", { state: { court } });
    console.log("court", court);
  };

  // Navigate to confirm booking page
  const handleBookNow = (court) => {
    navigate("/confirmbooking", { state: { court } });
  };

  // Render UI
  return (
    <>
      <h1 className="court-booking-title">BOOK A COURT</h1>
      {/* Loading, error, and empty state messages */}
      {loading && <p>Loading courts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && courts.length === 0 && <p>No courts available for booking.</p>}
      {/* Courts grid */}
      {!loading && courts.length > 0 && (

      <div className="court-grid">
        {courts.map((court) => (
          <div key={court.Id} className="court-card">
            {/* Court image */}
          <div className="court-card-image">
            <img
              src={`/${court.Image}`}
              alt={court.Name}
              className="court-card-img"
              style={{
                width: "300px",
                height: "330px",
                objectFit: "cover",
                borderRadius: "6px",
                background: "#eaeaea",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
            />
          </div>
            {/* Court name */}
            <div className="court-card-title">{court.Name}</div>
            {/* Court details */}
            <div className="court-card-details">
              <strong>Location:</strong> {court.Location} <br />
              <strong>Price Per Hour:</strong> ${court.PricePerHour}
            </div>
            {/* Action buttons */}
            <div className="court-card-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleView(court)}
              >
                View
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleBookNow(court)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
  // ...existing code...
        )}
      {/* Footer component */}
      <Footer />
    </>
  );
};

export default CourtBooking;
