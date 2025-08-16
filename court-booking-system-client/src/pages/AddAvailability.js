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
    AvailableStartDate: "",
    AvailableEndDate: "",
    AvailableStartTime: "",
    AvailableEndTime: "",
    selectedDays: [], // New field for recurring days
  });

  const [availabilityMode, setAvailabilityMode] = useState("single"); // "single" or "range"
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isNftMinted, setIsNftMinted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [enableNftFacility, setEnableNftFacility] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

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

  const handleDaySelection = (dayValue) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayValue)
        ? prev.selectedDays.filter(day => day !== dayValue)
        : [...prev.selectedDays, dayValue]
    }));
  };

  const handleNftFacilityChange = (e) => {
    setEnableNftFacility(e.target.checked);
    if (!e.target.checked) {
      setIsNftMinted(false);
      setSuccessMessage("");
    }
  };

  // Generate dates based on mode and selected days
  const generateDates = () => {
    const dates = [];
    
    if (availabilityMode === "single") {
      if (formData.AvailableStartDate) {
        dates.push(formData.AvailableStartDate);
      }
    } else {
      // Range mode
      if (!formData.AvailableStartDate || !formData.AvailableEndDate) {
        return dates;
      }

      const startDate = new Date(formData.AvailableStartDate);
      const endDate = new Date(formData.AvailableEndDate);
      
      // If no specific days selected, add all dates in range
      if (formData.selectedDays.length === 0) {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split("T")[0]);
        }
      } else {
        // Add only selected days of the week within the range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          if (formData.selectedDays.includes(d.getDay())) {
            dates.push(d.toISOString().split("T")[0]);
          }
        }
      }
    }
    
    return dates;
  };

  const saveMintedNft = (courtId, tokenId) => {
    const existing = JSON.parse(localStorage.getItem("mintedNFTs") || "[]");
    if (!existing.some((item) => item.tokenId === tokenId)) {
      existing.push({ courtId, tokenId });
      localStorage.setItem("mintedNFTs", JSON.stringify(existing));
    }
    localStorage.setItem("lastMintedNFTTokenId", tokenId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    if (enableNftFacility && !isNftMinted) {
      setError("You must mint the NFT before adding availability.");
      setIsLoading(false);
      return;
    }

    const { AvailableStartTime, AvailableEndTime } = formData;

    if (!AvailableStartTime || !AvailableEndTime) {
      setError("Please fill in start and end times.");
      setIsLoading(false);
      return;
    }

    if (AvailableStartTime >= AvailableEndTime) {
      setError("End time must be after start time.");
      setIsLoading(false);
      return;
    }

    // Generate all dates to add
    const datesToAdd = generateDates();
    
    if (datesToAdd.length === 0) {
      setError("Please select at least one date.");
      setIsLoading(false);
      return;
    }

    // Validate time for today's date if included
    const todayIncluded = datesToAdd.includes(today);
    if (todayIncluded && AvailableStartTime < getCurrentTimeString()) {
      setError("Start time must be in the future for today's date.");
      setIsLoading(false);
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;
      const errors = [];

      // Add availability for each date
      for (const date of datesToAdd) {
        try {
          const availabilityData = {
            courtId,
            AvailableDate: date,
            AvailableStartTime,
            AvailableEndTime,
            ...(enableNftFacility && {
              hasNftFacility: true,
              nftTokenId: localStorage.getItem("lastMintedNFTTokenId")
            })
          };

          const response = await courtService.addAvailability(availabilityData);

          if (response.success) {
            successCount++;
          } else {
            failCount++;
            errors.push(`${date}: ${response.error || "Failed to add"}`);
          }
        } catch (err) {
          failCount++;
          errors.push(`${date}: ${err.message}`);
        }
      }

      // Set result message
      if (successCount > 0 && failCount === 0) {
        setSuccessMessage(
          `Successfully added availability for ${successCount} date${successCount > 1 ? 's' : ''}!`
        );
        // Reset form
        setFormData({
          AvailableStartDate: "",
          AvailableEndDate: "",
          AvailableStartTime: "",
          AvailableEndTime: "",
          selectedDays: [],
        });
        if (enableNftFacility) {
          setIsNftMinted(false);
          setEnableNftFacility(false);
        }
      } else if (successCount > 0 && failCount > 0) {
        setSuccessMessage(`Added availability for ${successCount} dates.`);
        setError(`Failed for ${failCount} dates: ${errors.join(", ")}`);
      } else {
        setError(`Failed to add availability: ${errors.join(", ")}`);
      }

    } catch (err) {
      setError(err.message || "An error occurred while adding availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const mintNft = async () => {
    const { AvailableStartTime, AvailableEndTime } = formData;
    const dates = generateDates();

    if (dates.length === 0 || !AvailableStartTime || !AvailableEndTime) {
      setError("Please enter date(s) and time before minting NFT.");
      return;
    }

    setIsMinting(true);
    setError("");
    setSuccessMessage("");

    try {
      const firstDate = dates[0];
      const plainUri = `court-${courtId}-${firstDate}-${AvailableStartTime}`;
      const memo = `Court #${courtId} | ${firstDate} ${AvailableStartTime}-${AvailableEndTime}`;

      const xrplService = new XrplService(provider);
      const mintResult = await xrplService.mintNFT(memo, plainUri);

      if (mintResult?.result?.tx_json?.hash) {
        await xrplService.waitForConfirmation(mintResult.result.tx_json.hash);
        const mintedNft = await xrplService.getNftFromUri(plainUri);

        if (mintedNft) {
          await courtService.mintNFTOnServer({
            courtId,
            NFTokenID: mintedNft,
            AvailableDate: firstDate,
            AvailableStartTime,
            AvailableEndTime,
          });

          saveMintedNft(courtId, mintedNft);
          setSuccessMessage(`NFT minted successfully! Token ID: ${mintedNft}`);
          setError("");
          setIsNftMinted(true);
          alert("NFT minted! You can now add availability.");
        } else {
          setError("NFT mint confirmed but token not found.");
          setIsNftMinted(false);
        }
      } else {
        setError("NFT minting failed.");
        setIsNftMinted(false);
      }
    } catch (err) {
      setError("Error minting NFT: " + err.message);
      setIsNftMinted(false);
    } finally {
      setIsMinting(false);
    }
  };

  const copyTokenIdToClipboard = () => {
    const tokenId = localStorage.getItem("lastMintedNFTTokenId");
    if (tokenId) {
      navigator.clipboard.writeText(tokenId);
      alert("Token ID copied to clipboard!");
    }
  };

  const previewDates = generateDates();

  return (
    <div className="addavailability-container mt-5">
      <h2 className="addavailability-title">Add Availability for Court #{courtId}</h2>
      <form onSubmit={handleSubmit} className="addavailability-card">
        
        {/* NFT Facility Checkbox */}
        <div className="mb-3">
          <label className="addavailability-label">
            <input
              type="checkbox"
              checked={enableNftFacility}
              onChange={handleNftFacilityChange}
              style={{ marginRight: "8px" }}
            />
            Enable NFT Facility (Optional)
          </label>
          <small className="form-text text-muted" style={{ display: "block", marginTop: "5px" }}>
            Check this if you want to provide NFT facility for this availability slot
          </small>
        </div>

        {/* Availability Mode Selection */}
        <div className="mb-3">
          <label className="addavailability-label">Availability Mode</label>
          <div style={{ marginTop: "8px" }}>
            <label style={{ marginRight: "20px" }}>
              <input
                type="radio"
                value="single"
                checked={availabilityMode === "single"}
                onChange={(e) => setAvailabilityMode(e.target.value)}
                style={{ marginRight: "5px" }}
              />
              Single Date
            </label>
            <label>
              <input
                type="radio"
                value="range"
                checked={availabilityMode === "range"}
                onChange={(e) => setAvailabilityMode(e.target.value)}
                style={{ marginRight: "5px" }}
              />
              Date Range
            </label>
          </div>
        </div>

        {/* Date Selection */}
        {availabilityMode === "single" ? (
          <div className="mb-3">
            <label htmlFor="AvailableStartDate" className="addavailability-label">Date</label>
            <input
              type="date"
              name="AvailableStartDate"
              id="AvailableStartDate"
              value={formData.AvailableStartDate}
              min={today}
              onChange={handleInputChange}
              className="addavailability-input"
              required
            />
          </div>
        ) : (
          <>
            <div className="mb-3">
              <label htmlFor="AvailableStartDate" className="addavailability-label">Start Date</label>
              <input
                type="date"
                name="AvailableStartDate"
                id="AvailableStartDate"
                value={formData.AvailableStartDate}
                min={today}
                onChange={handleInputChange}
                className="addavailability-input"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="AvailableEndDate" className="addavailability-label">End Date</label>
              <input
                type="date"
                name="AvailableEndDate"
                id="AvailableEndDate"
                value={formData.AvailableEndDate}
                min={formData.AvailableStartDate || today}
                onChange={handleInputChange}
                className="addavailability-input"
                required
              />
            </div>

            {/* Days of Week Selection */}
            <div className="mb-3">
              <label className="addavailability-label">Select Days (Optional - leave empty for all days)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
                {daysOfWeek.map((day) => (
                  <label key={day.value} style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={formData.selectedDays.includes(day.value)}
                      onChange={() => handleDaySelection(day.value)}
                      style={{ marginRight: "5px" }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Time Selection */}
        <div className="mb-3">
          <label htmlFor="AvailableStartTime" className="addavailability-label">Start Time</label>
          <input
            type="time"
            name="AvailableStartTime"
            id="AvailableStartTime"
            value={formData.AvailableStartTime}
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

        {/* Preview Selected Dates */}
        {previewDates.length > 0 && (
          <div className="mb-3" style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
            <strong>Selected Dates Preview ({previewDates.length} dates):</strong>
            <div style={{ marginTop: "5px", fontSize: "14px" }}>
              {previewDates.slice(0, 10).join(", ")}
              {previewDates.length > 10 && ` ... and ${previewDates.length - 10} more dates`}
            </div>
          </div>
        )}

        {/* Error message for NFT facility */}
        {enableNftFacility && !isNftMinted && (
          <div className="addavailability-error" style={{ marginBottom: "1rem" }}>
            You must mint the NFT before adding availability.
          </div>
        )}

        {/* Mint NFT button */}
        {enableNftFacility && (
          <button
            type="button"
            className="addavailability-btn mint-nft mt-3"
            onClick={mintNft}
            disabled={isLoading || isMinting}
            style={{ marginBottom: "1rem" }}
          >
            {isMinting ? "Minting NFT..." : "Mint NFT"}
          </button>
        )}

        {/* Add Availability button */}
        <button
          type="submit"
          className="addavailability-btn"
          disabled={isLoading || (enableNftFacility && !isNftMinted) || previewDates.length === 0}
        >
          {isLoading ? "Adding..." : `Add Availability (${previewDates.length} dates)`}
        </button>

        {/* Display errors and success messages */}
        {error && <p className="addavailability-error">{error}</p>}

        {successMessage && (
          <>
            <p className="addavailability-success">{successMessage}</p>

            {enableNftFacility && (
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
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default AddAvailability;