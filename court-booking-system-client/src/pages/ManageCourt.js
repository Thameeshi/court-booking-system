import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import "../styles/ManageCourt.css";

const ManageCourt = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const courtsPerPage = 6;

  const ownerEmail = process.env.USER_EMAIL || "hayeshahp6@gmail.com";
  const navigate = useNavigate();
  const { provider } = useSelector((state) => state.auth);
  const [tokenIds, setTokenIds] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true);
        const response = await courtService.getCourtByOwner(ownerEmail);
        if (response.success) {
          setCourts(response.success);
          console.log("Courts data:", response.success);
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
  }, [ownerEmail]);

  const handleDelete = async (courtId) => {
    if (!window.confirm("Are you sure you want to delete this court?")) return;

    try {
      const response = await courtService.deleteCourt(courtId);
      if (response.success) {
        setCourts(courts.filter((court) => court.Id !== courtId));
        alert("Court deleted successfully.");
      } else {
        alert("Failed to delete court.");
      }
    } catch (err) {
      alert(err.message || "An error occurred while deleting the court.");
    }
  };

  const handleEdit = (courtId) => {
    navigate(`/dashboard/edit-court/${courtId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateSellOffer = async (nftId) => {
    if (!nftId) {
      alert("Please provide the NFTokenID.");
      return;
    }
    const amountInXRP = 1.0;
    const memo = "Court booking sell offer";
    const xrpl = new XrplService(provider);
    const response = await xrpl.createSellOffer(nftId, amountInXRP, memo);
    console.log("Sell offer response:", response);
    alert("Sell offer created successfully!");
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

  const indexOfLastCourt = currentPage * courtsPerPage;
  const indexOfFirstCourt = indexOfLastCourt - courtsPerPage;
  const currentCourts = courts.slice(indexOfFirstCourt, indexOfLastCourt);
  const totalPages = Math.ceil(courts.length / courtsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Manage My Courts</h1>
      {loading && <p>Loading courts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && courts.length === 0 && <p>No courts found.</p>}
      {!loading && courts.length > 0 && (
        <>
          <div className="court-grid">
            {currentCourts.map((court) => (
              <div className="card" key={court.Id}>
                {/* Images container */}
                <div className="card-images-container">
                  {[court.Image1, court.Image2, court.Image3]
                    .filter(Boolean)
                    .map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${court.Name}-${idx}`}
                        onClick={() => openModal(img)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                </div>

                {/* Court details */}
                <div className="card-content">
                  <h5 className="card-title">{court.Name}</h5>
                  <p className="card-text">
                    <strong>Location:</strong> {court.Location} <br />
                    <strong>Type:</strong> {court.Type} <br />
                    <strong>Price Per Hour:</strong> ${court.PricePerHour} <br />
                    <strong>Availability:</strong> {court.Availability} <br />
                    <strong>Available Date:</strong> {formatDate(court.AvailableDate)} <br />
                    <strong>Available Time:</strong>{" "}
                    {court.AvailableStartTime || "Not set"} - {court.AvailableEndTime || "Not set"}
                  </p>

                  <div className="card-buttons">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(court.Id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(court.Id)}
                    >
                      Delete
                    </button>
                    <br />
                    <div>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter Token ID"
                        value={tokenIds[court.Id] || ""}
                        onChange={(e) =>
                          setTokenIds({ ...tokenIds, [court.Id]: e.target.value })
                        }
                      />
                      <button
                        onClick={() =>
                          handleCreateSellOffer(tokenIds[court.Id] || court.NFTokenID)
                        }
                        className="btn btn-primary"
                        disabled={!tokenIds[court.Id] && !court.NFTokenID}
                      >
                        Create Sell Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <nav className="mt-4 d-flex justify-content-center">
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <li
                  key={number}
                  className={`page-item ${currentPage === number ? "active" : ""}`}
                >
                  <button onClick={() => paginate(number)} className="page-link">
                    {number}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
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

export default ManageCourt;
