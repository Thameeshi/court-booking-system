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
  const [isMinting, setIsMinting] = useState(false);
  const [isNftMinted, setIsNftMinted] = useState(false);
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

  // --- New helper function to save minted NFT (courtId + tokenId) in localStorage ---
  const saveMintedNft = (courtId, tokenId) => {
    const existing = JSON.parse(localStorage.getItem("mintedNFTs") || "[]");
    if (!existing.some((item) => item.tokenId === tokenId)) {
      existing.push({ courtId, tokenId });
      localStorage.setItem("mintedNFTs", JSON.stringify(existing));
    }
    // Also save last minted tokenId for quick access if needed
    localStorage.setItem("lastMintedNFTTokenId", tokenId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (!isNftMinted) {
      setError("You must mint the NFT before adding availability.");
      setIsLoading(false);
      return;
    }

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
        setIsNftMinted(false); // Reset for next entry
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

    setIsMinting(true);
    setError("");
    setSuccessMessage("");

    try {
      const plainUri = `court-${courtId}-${AvailableDate}-${AvailableStartTime}`;
      const memo = `Court #${courtId} | ${AvailableDate} ${AvailableStartTime}-${AvailableEndTime}`;

      const xrplService = new XrplService(provider);
      const mintResult = await xrplService.mintNFT(memo, plainUri);

      if (mintResult?.result?.tx_json?.hash) {
        await xrplService.waitForConfirmation(mintResult.result.tx_json.hash);
        const mintedNft = await xrplService.getNftFromUri(plainUri);

        if (mintedNft) {
          await courtService.mintNFTOnServer({
            courtId,
            NFTokenID: mintedNft,
            AvailableDate,
            AvailableStartTime,
            AvailableEndTime,
          });

          // Save minted NFT tokenId along with courtId to localStorage
          saveMintedNft(courtId, mintedNft);

          setSuccessMessage(`NFT minted and stored successfully! Token ID: ${mintedNft}`);
          setError("");
          setIsNftMinted(true);
          alert("NFT minted! You will now be able to add availability.");
        } else {
          setError("NFT mint confirmed but token not found.");
          setSuccessMessage("");
          setIsNftMinted(false);
        }
      } else {
        setError("NFT minting failed.");
        setSuccessMessage("");
        setIsNftMinted(false);
      }
    } catch (err) {
      setError("Error minting NFT: " + err.message);
      setSuccessMessage("");
      setIsNftMinted(false);
    } finally {
      setIsMinting(false);
    }
  };

  // Copy to clipboard handler
  const copyTokenIdToClipboard = () => {
    const tokenId = localStorage.getItem("lastMintedNFTTokenId");
    if (tokenId) {
      navigator.clipboard.writeText(tokenId);
      alert("Token ID copied to clipboard!");
    }
  };

  return (
    <div className="addavailability-container mt-5">
      <h2 className="addavailability-title">Add Availability for Court #{courtId}</h2>
      <form onSubmit={handleSubmit} className="addavailability-card">
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

        {/* Error message for trying to add before minting NFT */}
        {!isNftMinted && (
          <div className="addavailability-error" style={{ marginBottom: "1rem" }}>
            You must mint the NFT before adding availability.
          </div>
        )}

        {/* Mint NFT button */}
        <button
          type="button"
          className="addavailability-btn mint-nft mt-3"
          onClick={mintNft}
          disabled={isLoading || isMinting}
          style={{ marginBottom: "1rem" }}
        >
          {isMinting ? "Minting NFT..." : "Mint NFT"}
        </button>

        {/* Add Availability button */}
        <button
          type="submit"
          className="addavailability-btn"
          disabled={isLoading || !isNftMinted}
        >
          {isLoading ? "Adding..." : "Add Availability"}
        </button>

        {/* Display errors and success messages */}
        {error && <p className="addavailability-error">{error}</p>}

        {successMessage && (
          <>
            <p className="addavailability-success">{successMessage}</p>

            <div className="copy-token-wrapper">
  <label className="copy-token-label">Last Minted NFT Token ID:</label>
  <input
    className="copy-token-input"
    type="text"
    readOnly
    value={localStorage.getItem("lastMintedNFTTokenId") || ""}
    onFocus={(e) => e.target.select()}
  />
  <button
    type="button"
    className="copy-token-button"
    onClick={copyTokenIdToClipboard}
  >
    Copy Token ID
  </button>
</div>

          </>
        )}
      </form>
    </div>
  );
};

export default AddAvailability;
