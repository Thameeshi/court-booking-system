import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import { useSelector } from "react-redux";

const AddAvailability = () => {
  const { courtId } = useParams();
  const { provider } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AvailableDate: "",
    AvailableStartTime: "",
    AvailableEndTime: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!formData.AvailableDate || !formData.AvailableStartTime || !formData.AvailableEndTime) {
        setError("Please fill in all fields.");
        setIsLoading(false);
        return;
      }

      // Always send courtId in the payload!
      const response = await courtService.addAvailability({
        courtId,
        ...formData,
      });

      if (response.success) {
        setSuccessMessage("Availability added successfully!");
        setFormData({
          AvailableDate: "",
          AvailableStartTime: "",
          AvailableEndTime: "",
        });
        // Optionally, redirect after success:
        // navigate("/dashboard/myCourts");
      } else {
        setError(response.error || "Failed to add availability. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while adding availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const mintNft = async () => {
  if (!formData.AvailableDate || !formData.AvailableStartTime || !formData.AvailableEndTime) {
    setError("Please enter date and time before minting NFT.");
    return;
  }

  try {
    const plainUri = `court-${courtId}-${formData.AvailableDate}-${formData.AvailableStartTime}`;
    const memo = `Court #${courtId} | ${formData.AvailableDate} ${formData.AvailableStartTime}-${formData.AvailableEndTime}`;
    
    const xrplService = new XrplService(provider);
    const mintResult = await xrplService.mintNFT(memo, plainUri);

    if (mintResult?.result?.tx_json?.hash) {
      // Wait for confirmation
      const confirmedTx = await xrplService.waitForConfirmation(mintResult.result.tx_json.hash);
      const mintedNft = await xrplService.getNftFromUri(plainUri);


      if (mintedNft) {
        await courtService.mintNFTOnServer({
          courtId,
          NFTokenID: mintedNft,
          AvailableDate: formData.AvailableDate,
          AvailableStartTime: formData.AvailableStartTime,
          AvailableEndTime: formData.AvailableEndTime
        });

        setSuccessMessage(`NFT minted and stored successfully! Token ID: ${mintedNft}`);
      } else {
        setError("NFT mint confirmed but token not found.");
      }
    } else {
      setError("NFT minting failed.");
    }
  } catch (err) {
    setError("Error minting NFT: " + err.message);
  }
};


  return (
    <div className="container mt-5">
      <h2 className="mb-4">Add Availability for Court {courtId}</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label htmlFor="AvailableDate" className="form-label">Date</label>
          <input
            type="date"
            name="AvailableDate"
            id="AvailableDate"
            value={formData.AvailableDate}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="AvailableStartTime" className="form-label">Start Time</label>
          <input
            type="time"
            name="AvailableStartTime"
            id="AvailableStartTime"
            value={formData.AvailableStartTime}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="AvailableEndTime" className="form-label">End Time</label>
          <input
            type="time"
            name="AvailableEndTime"
            id="AvailableEndTime"
            value={formData.AvailableEndTime}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Availability"}
        </button>
        {error && <p className="text-danger mt-3">{error}</p>}
        {successMessage && <p className="text-success mt-3">{successMessage}</p>}
        <button
          type="button"
          className="btn btn-secondary mt-3"
          onClick={mintNft}
          disabled={isLoading}
        >
          Mint NFT
        </button>

      </form>
    </div>
  );
};

export default AddAvailability;
