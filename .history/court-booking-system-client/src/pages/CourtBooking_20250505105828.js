import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

const CourtBooking = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);

  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await courtService.getAllCourts();
        if (response.success) {
          setCourts(response.success);
        } else {
          setError("Failed to fetch courts.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching courts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const handleView = (court) => {
    navigate("/viewcourt", { state: { court } }); // Navigate to the ViewCourt page
  };

  const handleBookNow = (court) => {
    navigate("/confirmbooking", { state: { court } }); // Navigate to ConfirmBooking with selected court
  };

  return (
    <div className="container mt-5">
      <h1>Book a Court</h1>
      {loading && <p>Loading courts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && courts.length === 0 && <p>No courts available for booking.</p>}
      {!loading && courts.length > 0 && (
        <ul className="list-group">
          {courts.map((court) => (
            <li key={court.Id} className="list-group-item">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <img
                    src={court.Image}
                    alt={court.Name}
                    className="img-fluid rounded"
                    style={{ height: "100px", objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-6">
                  <h5>{court.Name}</h5>
                  <p>
                    <strong>Location:</strong> {court.Location} <br />
                    <strong>Price Per Hour:</strong> ${court.PricePerHour}
                  </p>
                </div>
                <div className="col-md-3 text-end">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleView(court)} // View button now navigates to ViewCourt
                  >
                    View
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleBookNow(court)} // Book Now button now navigates to ConfirmBooking
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourtBooking;import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

const CourtBooking = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);

  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await courtService.getAllCourts();
        if (response.success) {
          setCourts(response.success);
        } else {
          setError("Failed to fetch courts.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching courts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourts();
  }, []);

  const handleView = (court) => {
    navigate("/viewcourt", { state: { court } }); // Navigate to the ViewCourt page
  };

  const handleBookNow = (court) => {
    navigate("/confirmbooking", { state: { court } }); // Navigate to ConfirmBooking with selected court
  };

  return (
    <div className="container mt-5">
      <h1>Book a Court</h1>
      {loading && <p>Loading courts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && courts.length === 0 && <p>No courts available for booking.</p>}
      {!loading && courts.length > 0 && (
        <ul className="list-group">
          {courts.map((court) => (
            <li key={court.Id} className="list-group-item">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <img
                    src={court.Image}
                    alt={court.Name}
                    className="img-fluid rounded"
                    style={{ height: "100px", objectFit: "cover" }}
                  />
                </div>
                <div className="col-md-6">
                  <h5>{court.Name}</h5>
                  <p>
                    <strong>Location:</strong> {court.Location} <br />
                    <strong>Price Per Hour:</strong> ${court.PricePerHour}
                  </p>
                </div>
                <div className="col-md-3 text-end">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleView(court)} // View button now navigates to ViewCourt
                  >
                    View
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleBookNow(court)} // Book Now button now navigates to ConfirmBooking
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourtBooking;
