import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import { useSelector } from "react-redux";
import "../styles/AddAvailability.css";

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

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
  const now = new Date();

  const getCurrentTimeString = () => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isTodaySelected = formData.AvailableDate === today;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    const { AvailableDate, AvailableStartTime, AvailableEndTime } = formData;

    if (!AvailableDate || !AvailableStartTime || !AvailableEndTime) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (AvailableStartTime >= AvailableEndTime) {
      setError("End time must be after start time.");
      setIsLoading(false);
      return;
    }

    if (AvailableDate === today && AvailableStartTime < getCurrentTimeString()) {
      setError("Start time must be in the future.");
      setIsLoading(false);
      return;
    }

    try {
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
    const { AvailableDate, AvailableStartTime, AvailableEndTime } = formData;

    if (!AvailableDate || !AvailableStartTime || !AvailableEndTime) {
      setError("Please enter date and time before minting NFT.");
      return;
    }

    try {
      const plainUri = `court-${courtId}-${AvailableDate}-${AvailableStartTime}`;
      const memo = `Court #${courtId} | ${AvailableDate} ${AvailableStartTime}-${AvailableEndTime}`;

      const xrplService = new XrplService(provider);
      const mintResult = await xrplService.mintNFT(memo, plainUri);

      if (mintResult?.result?.tx_json?.hash) {
        const confirmedTx = await xrplService.waitForConfirmation(mintResult.result.tx_json.hash);
        const mintedNft = await xrplService.getNftFromUri(plainUri);

        if (mintedNft) {
          await courtService.mintNFTOnServer({
            courtId,
            NFTokenID: mintedNft,
            AvailableDate,
            AvailableStartTime,
            AvailableEndTime,
          });

          setSuccessMessage(`NFT minted and stored successfully! Token ID: ${mintedNft}`);
          setError("");
        } else {
          setError("NFT mint confirmed but token not found.");
          setSuccessMessage("");
        }
      } else {
        setError("NFT minting failed.");
        setSuccessMessage("");
      }
    } catch (err) {
      setError("Error minting NFT: " + err.message);
      setSuccessMessage("");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Add Availability for Court #{courtId}</h2>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label htmlFor="AvailableDate" className="addavailability-label">Date</label>
          <input
            type="date"
            name="AvailableDate"
            id="AvailableDate"
            value={formData.AvailableDate}
            min={today}
            onChange={handleInputChange}
            className="addavailability-input"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="AvailableStartTime" className="addavailability-label">Start Time</label>
          <input
            type="time"
            name="AvailableStartTime"
            id="AvailableStartTime"
            value={formData.AvailableStartTime}
            min={isTodaySelected ? getCurrentTimeString() : undefined}
            onChange={handleInputChange}
            className="addavailability-input"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="AvailableEndTime" className="addavailability-label">End Time</label>
          <input
            type="time"
            name="AvailableEndTime"
            id="AvailableEndTime"
            value={formData.AvailableEndTime}
            onChange={handleInputChange}
            className="addavailability-input"
            required
          />
        </div>
        <button type="submit" className="addavailability-btn" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Availability"}
        </button>
        {error && <p className="addavailability-error">{error}</p>}
        {successMessage && <p className="addavailability-success">{successMessage}</p>}
        <button
          type="button"
          className="addavailability-btn mt-3"
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
