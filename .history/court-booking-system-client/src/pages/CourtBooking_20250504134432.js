import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import courtService from "../services/domain-services/CourtService";

const CourtBooking = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null); // State to track the selected court
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate(); // Initialize navigate

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails({
      ...bookingDetails,
      [name]: value,
    });
  };

  const handleBookNow = (court) => {
    setSelectedCourt(court); // Set the selected court for booking
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log("Booking Details:", bookingDetails);
    alert(`Court "${selectedCourt.Name}" booked successfully!`);
    setSelectedCourt(null); // Reset the selected court after booking
  };

  const handleView = (court) => {
    navigate(`/view-court/${court.Id}`); // Navigate to the ViewCourt page with courtId
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
                    src={court.Image} // Assuming `Image` contains the image URL
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
            </li>
          ))}
        </ul>
      )}

      {/* Booking Form */}
      {selectedCourt && (
        <div className="mt-5">
          <h2>Book Court: {selectedCourt.Name}</h2>
          <form onSubmit={handleBookingSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={bookingDetails.name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={bookingDetails.email}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Booking Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={bookingDetails.date}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="time" className="form-label">
                Booking Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={bookingDetails.time}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Confirm Booking
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setSelectedCourt(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CourtBooking;