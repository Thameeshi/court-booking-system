import React, { useEffect, useState } from "react";
import courtService from "../services/domain-services/CourtService";
import "../styles/AdminCourts.css";

const AdminCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const res = await courtService.getAllCourts();
      if (res.success) {
        setCourts(res.success);
      } else {
        setCourts([]);
      }
    } catch (error) {
      console.error("Error fetching courts:", error);
      setCourts([]);
    }
    setLoading(false);
  };

  const handleDelete = async (courtId) => {
    if (window.confirm("Are you sure you want to delete this court?")) {
      try {
        const res = await courtService.deleteCourt(courtId);
        if (res.success) {
          alert("Court deleted successfully");
          fetchCourts();
        } else {
          alert("Failed to delete court");
        }
      } catch (error) {
        console.error("Error deleting court:", error);
        alert("Error deleting court");
      }
    }
  };

  // Modal open/close handlers
  const openModal = (img) => {
    setModalImage(img);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  if (loading) return <div className="adminCourtsLoading">Loading courts...</div>;

  return (
    <div className="adminCourtsContainer">
      <h2 className="adminCourtsTitle">Manage Courts (Admin)</h2>
      {courts.length === 0 ? (
        <p className="adminCourtsNoData">No courts found.</p>
      ) : (
        <table className="adminCourtsTable" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Images</th>
              <th>Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Price Per Hour</th>
              <th>Owner Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courts.map((court) => (
              <tr key={court.Id}>
                <td className="adminCourtsImagesCell">
                  {[court.Image1, court.Image2, court.Image3]
                    .filter(Boolean)
                    .map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${court.Name}-${idx}`}
                        className="adminCourtThumbnail"
                        onClick={() => openModal(img)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  {(!court.Image1 && !court.Image2 && !court.Image3) && <span>No image</span>}
                </td>
                <td>{court.Name}</td>
                <td>{court.Location}</td>
                <td>{court.Type}</td>
                <td>{court.PricePerHour}</td>
                <td>{court.Email}</td>
                <td>
                  <button
                    className="adminCourtsDeleteBtn"
                    onClick={() => handleDelete(court.Id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for full image */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Full view" />
            <button onClick={closeModal} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourts;
