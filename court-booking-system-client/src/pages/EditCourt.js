import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";
import "../styles/EditCourt.css";

const EditCourt = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [error, setError] = useState("");
  const { provider } = useSelector((state) => state.auth);
  const [tokenId, setTokenId] = useState("");
  const [offerId, setOfferId] = useState("");

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const allCourts = await courtService.getAllCourts();
        const found = allCourts.success?.find(c => c.Id === parseInt(courtId));
        setCourt(found || null);
      } catch (err) {
        setError("Failed to load court.");
      }
    };
    fetchCourt();
  }, [courtId]);

  const handleChange = (e) => {
    setCourt({ ...court, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await courtService.updateCourt(courtId, court);

      if (response.success) {
        alert("Court updated.");
        navigate("/manage-court");
      } else {
        alert("Failed to update.");
      }
    } catch (err) {
      alert("Error while updating court.");
    }
  };

  const handleBurnNFT = async () => {
      if (!tokenId) {
        alert("Please enter a valid Token ID");
        return;
      }
  
      try {
        const rpc = new XrplService(provider);
        const result = await rpc.burnNFT(tokenId);
        console.log(`NFT burned successfully: ${result}`);
        alert("NFT burned successfully!");
        setTokenId("");
      } catch (error) {
        console.error("Error burning NFT:", error);
      }
    };

  if (!court) return <p className="editcourt-loading">Loading...</p>;

  return (
    <div className="editcourt-wrapper">
      <h2 className="editcourt-title">Edit Court</h2>
      {error && <p className="editcourt-error">{error}</p>}
      <form onSubmit={handleSubmit} className="editcourt-form">
        <label className="editcourt-label" htmlFor="Name">Name</label>
        <input
          id="Name"
          name="Name"
          value={court.Name}
          onChange={handleChange}
          placeholder="Court Name"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="Location">Location</label>
        <input
          id="Location"
          name="Location"
          value={court.Location}
          onChange={handleChange}
          placeholder="Location"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="Type">Type</label>
        <input
          id="Type"
          name="Type"
          value={court.Type}
          onChange={handleChange}
          placeholder="Type"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="PricePerHour">Price Per Hour</label>
        <input
          id="PricePerHour"
          name="PricePerHour"
          type="number"
          min="0"
          value={court.PricePerHour}
          onChange={handleChange}
          placeholder="Price"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="AvailableDate">Available Date</label>
        <input
          type="date"
          id="AvailableDate"
          name="AvailableDate"
          value={court.AvailableDate || ""}
          onChange={handleChange}
          className="editcourt-input"
        />

        <label className="editcourt-label" htmlFor="AvailableStartTime">Available Start Time</label>
        <input
          type="time"
          id="AvailableStartTime"
          name="AvailableStartTime"
          value={court.AvailableStartTime || ""}
          onChange={handleChange}
          className="editcourt-input"
        />

        <label className="editcourt-label" htmlFor="AvailableEndTime">Available End Time</label>
        <input
          type="time"
          id="AvailableEndTime"
          name="AvailableEndTime"
          value={court.AvailableEndTime || ""}
          onChange={handleChange}
          className="editcourt-input"
        />

        <label className="editcourt-label" htmlFor="Availability">Availability</label>
        <input
          id="Availability"
          name="Availability"
          value={court.Availability}
          onChange={handleChange}
          placeholder="Availability"
          className="editcourt-input"
        />

        <button type="submit" className="editcourt-btn">Update Court</button>

        <div className="mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            <button className="btn btn-danger" onClick={handleBurnNFT} style={{
              width:"100%",
              padding: "3px",
              fontSize: "14px"
            }} >
              Burn NFT
            </button>
          </div>
      </form>
    </div>
  );
};

export default EditCourt;
