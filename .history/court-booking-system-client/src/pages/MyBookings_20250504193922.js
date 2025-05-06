import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // In a real app, this would come from auth context or session
    // For testing purposes, we can set a default email or get from localStorage
    const email = localStorage.getItem("userEmail") || "";
    setUserEmail(email);
  }, []);

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!userEmail) {
      setError("Please enter your email address");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setBookings([]);
      setDebugInfo(null);
      
      // Save email for convenience in future searches
      localStorage.setItem("userEmail", userEmail);
      
      console.log("Fetching bookings for email:", userEmail);
      const response = await courtService.getUserBookings(userEmail);
      console.log("Response received:", response);
      
      setDebugInfo({ 
        requestSent: {
          type: "Court",
          subType: "getUserBookings",
          data: { UserEmail: userEmail }
        },
        responseReceived: response
      });
      
      if (response && response.success) {
        setBookings(Array.isArray(response.success) ? response.success : []);
        if (Array.isArray(response.success) && response.success.length === 0) {
          setError("No bookings found for this email.");
        }
      } else {
        setError(response.error || "Failed to fetch bookings.");
        console.error("Error response:", response);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "An error occurred while fetching bookings.");
      setDebugInfo({ error: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If email is already set (from localStorage), fetch bookings automatically
    if (userEmail) {
      handleSearch();
    } else {
      setLoading(false);
    }
  }, []);

  const formatDateTime = (date, time) => {
    if (!date || !time) return "Not specified";
    return `${date} at ${time}`;
  };

  return (
    <div className="container mt-5">
      <h1>My Bookings</h1>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email address"
            value={userEmail}
            onChange={handleEmailChange}
            required
          />
          <button type="submit" className="btn btn-primary">
            Search Bookings
          </button>
        </div>
      </form>
      
      {loading && <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>}
      
      {error && <div className="alert alert-warning">{error}</div>}
      
      {!loading && bookings.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Court Name</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.Id}>
                  <td>{booking.CourtName}</td>
                  <td>{booking.Date}</td>
                  <td>{booking.StartTime}</td>
                  <td>{booking.EndTime}</td>
                  <td>
                    <span className={`badge ${booking.Status === 'Confirmed' ? 'bg-success' : 'bg-warning'}`}>
                      {booking.Status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {!loading && userEmail && bookings.length === 0 && !error && (
        <div className="alert alert-info">No bookings found for {userEmail}.</div>
      )}
      
      {/* Debug information - can be hidden in production */}
      {debugInfo && (
        <div className="mt-5 card">
          <div className="card-header bg-secondary text-white">
            Debug Information
          </div>
          <div className="card-body">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
