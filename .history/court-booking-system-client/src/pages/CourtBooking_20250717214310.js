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
      <div className="container1">
        <h1>BOOK A COURT</h1>
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
                    className="img-fluid rounded"
                    style={{ height: "300px", width: "400px", alignItems: "center", objectFit: "cover" , borderRadius: "1px" }}
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
                <div className="court-card-actions" style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: "#4AB420", borderColor: "#4AB420", color: "#fff", fontSize: "1.05rem", fontWeight: 600, padding: "9px 20px" }}
                    onClick={() => handleView(court)}
                  >
                    View
                  </button>
                  
                  <button
                    className="btn btn-success btn-sm"
                    style={{ backgroundColor: "#4AB420", borderColor: "#4AB420", color: "#fff", fontSize: "0.95rem", fontWeight: 600, padding: "10px 28px" }}
                    onClick={() => handleBookNow(court)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer component */}
      <Footer />
    </>
  );
};

export default CourtBooking;
