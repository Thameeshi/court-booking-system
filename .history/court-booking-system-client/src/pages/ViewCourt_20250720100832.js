import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ViewCourt.css";

const initialReviews = [
  { id: 1, user: "Joan Perkins", rating: 5, comment: "This court is a great addition. Featuring a mid-century vibe and very well maintained." },
  { id: 2, user: "Frank Garrett", rating: 4, comment: "Nice facility, but I had trouble finding parking." },
  { id: 3, user: "Randy Palmer", rating: 4, comment: "It was decent. Could use better lighting for night sessions." }
];

const StarRating = ({ rating, onRate, disabled = false, size = "1.2rem" }) => (
  <span className="star-rating" style={{ fontSize: size }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= rating ? "filled" : ""} ${onRate ? "clickable" : ""}`}
        onClick={() => !disabled && onRate && onRate(star)}
        role={onRate ? "button" : "img"}
        aria-label={star <= rating ? "Filled star" : "Empty star"}
        tabIndex={onRate && !disabled ? 0 : -1}
        onKeyDown={e => {
          if (onRate && !disabled && (e.key === "Enter" || e.key === " ")) onRate(star);
        }}
      >
        ★
      </span>
    ))}
  </span>
);

const ViewCourt = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => ratingCounts[r.rating - 1]++);

  const total = reviews.length;
  const averageRating = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : null;

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarSelect = (star) => {
    setNewReview((prev) => ({ ...prev, rating: star }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
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

  if (!court) {
    return (
      <div className="viewcourt-container">
        <div className="alert alert-warning mt-5 text-center">
          No court details found. Please go back and try again.
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="viewcourt-container">
          <div className="viewcourt-image">
            <img src={court.Image} alt={court.Name} className="viewcourt-image" />
            <h2 className="viewcourt-title-overlay">{court.Name}</h2>
          </div>
          <div className="viewcourt-details-section-modern">
            <h2 className="viewcourt-title-modern">Court Details</h2>
            <div className="viewcourt-details-grid">
              <p><strong>📍 Location:</strong> {court.Location}</p>
              <p><strong>🎯 Type:</strong> {court.Type}</p>
              <p><strong>💵 Price Per Hour:</strong> <span className="price-highlight">${court.PricePerHour}</span></p>
              <p><strong>📅 Available Date:</strong> {formatDate(court.AvailableDate)}</p>
              <p><strong>⏰ Available Hours:</strong> {court.AvailableStartTime || "Not specified"} - {court.AvailableEndTime || "Not specified"}</p>
              <p><strong>📧 Contact Email:</strong> <a href={`mailto:${court.Email}`}>{court.Email}</a></p>
              <p><strong>📝 Description:</strong> {court.Description || "No description provided."}</p>
            </div>

            <div className="viewcourt-actions-modern">
              <button className="btn-paynow-modern" onClick={() => navigate("/payment", { state: { court } })}>
                Pay Now
              </button>
              <button className="btn-goback-modern" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </div>


        {/* ---------- Review UI Below ---------- */}
        <div className="viewcourt-review-section">
          <h3 className="review-title">User Ratings</h3>
          {averageRating ? (
            <div className="rating-summary">
              <div className="rating-score">
                <div className="rating-value">{averageRating}</div>
                <div className="stars"><StarRating rating={Math.round(averageRating)} size="1.3rem" /></div>
                <div className="review-count">based on {total} reviews</div>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((star, i) => (
                  <div className="bar-row" key={star}>
                    <span>{star} ★</span>
                    <div className="bar">
                      <div
                        className={`fill ${star === 5 ? "excellent" : star === 4 ? "good" : star === 3 ? "avg" : star === 2 ? "below" : "poor"}`}
                        style={{ width: `${(ratingCounts[star - 1] / total) * 100 || 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="no-ratings">No reviews yet.</div>}

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <label>Your Rating:</label>
            <StarRating
              rating={newReview.rating}
              onRate={handleStarSelect}
              disabled={submitting}
              size="1.2rem"
            />
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
                className="review-submit-btn"
                disabled={submitting || !newReview.comment.trim()}
              >
                {submitting ? "Submitting..." : "Write a Review"}
              </button>

          </form>

          <div className="review-list">
            {reviews.map((r) => (
              <div className="review-item" key={r.id}>
                <div className="review-header">
                  <span className="review-user">{r.user}</span>
                  <StarRating rating={r.rating} size="1.1rem" />
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
     
    </div>
  );
};

export default ViewCourt;
