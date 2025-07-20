import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ViewCourt.css";

const initialReviews = [
  { id: 1, user: "Alice", rating: 5, comment: "Great court and friendly staff!" },
  { id: 2, user: "Bob", rating: 4, comment: "Nice surface, but parking is limited." }
];

const ViewCourt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  if (!court) {
    return (
      <div className="viewcourt-container">
        <div className="alert alert-warning mt-5 text-center">
          No court details found. Please go back and try again.
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    navigate("/payment", { state: { court } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate smart contract interaction
    setTimeout(() => {
      setReviews([
        {
          id: Date.now(),
          user: "You",
          rating: Number(newReview.rating),
          comment: newReview.comment
        },
        ...reviews
      ]);
      setNewReview({ rating: 5, comment: "" });
      setSubmitting(false);
    }, 600);
  };

  return (
    <div className="viewcourt-container">
      <div className="viewcourt-card">
        {/* Title above the image */}
        <h2
          className="viewcourt-title"
          style={{
            color: "#12822e",
            fontSize: "1.35rem",
            fontWeight: 700,
            margin: "22px 0 8px 0",
            textAlign: "center",
            letterSpacing: "0.5px"
          }}
        >
          {court.Name}
        </h2>
        <div className="viewcourt-img-section">
          <img
            src={court.Image}
            alt={court.Name}
            className="viewcourt-img"
          />
        </div>
        <div className="viewcourt-details-section">
          <div className="viewcourt-details-list">
            <p><strong>Location:</strong> {court.Location}</p>
            <p><strong>Type:</strong> {court.Type}</p>
            <p><strong>Price Per Hour:</strong> <span className="price-highlight">${court.PricePerHour}</span></p>
            <p><strong>Available Date:</strong> {formatDate(court.AvailableDate)}</p>
            <p><strong>Available Hours:</strong> {court.AvailableStartTime || "Not specified"} - {court.AvailableEndTime || "Not specified"}</p>
            <p><strong>Contact Email:</strong> <a href={`mailto:${court.Email}`}>{court.Email}</a></p>
            <p><strong>Description:</strong> {court.Description || "No description provided."}</p>
          </div>
          <div className="viewcourt-actions">
            <button className="btn btn-success prominent" onClick={handlePayment}>
              Pay Now
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>

        {/* Review Section */}
        <div className="viewcourt-review-section">
          <h3 className="review-title">Reviews & Comments</h3>
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <label>
              Rating:
              <select
                name="rating"
                value={newReview.rating}
                onChange={handleReviewChange}
                disabled={submitting}
                className="review-rating-select"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </label>
            <textarea
              name="comment"
              value={newReview.comment}
              onChange={handleReviewChange}
              placeholder="Write your comment..."
              required
              disabled={submitting}
              className="review-textarea"
            />
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting || !newReview.comment.trim()}
              style={{ marginTop: "10px" }}
            >
              {submitting ? "Submitting..." : "Add Review"}
            </button>
          </form>
          <div className="review-list">
            {reviews.length === 0 && <p>No reviews yet.</p>}
            {reviews.map((rev) => (
              <div key={rev.id} className="review-item">
                <div className="review-header">
                  <span className="review-user">{rev.user}</span>
                  <span className="review-rating">{Array(rev.rating).fill("★").join("")}</span>
                </div>
                <div className="review-comment">{rev.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourt;