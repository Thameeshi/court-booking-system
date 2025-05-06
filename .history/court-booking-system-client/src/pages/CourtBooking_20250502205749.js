import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";

const CourtBooking = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              <h5>{court.Name}</h5>
              <p>{court.Location}</p>
              <button className="btn btn-primary">Book Now</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourtBooking;