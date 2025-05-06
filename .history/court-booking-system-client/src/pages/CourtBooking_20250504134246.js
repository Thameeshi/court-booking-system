import { useNavigate } from "react-router-dom"; // Import useNavigate

const CourtBooking = () => {
  const navigate = useNavigate(); // Initialize navigate

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
    </div>
  );
};

export default CourtBooking;