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
  const [loading, setLoading] = useState(false);
  const { provider } = useSelector((state) => state.auth);
  const [tokenId, setTokenId] = useState("");

  // State for file uploads
  const [images, setImages] = useState({ Image1: null, Image2: null, Image3: null });
  // Previews for uploaded files or existing URLs
  const [previews, setPreviews] = useState({ Image1: "", Image2: "", Image3: "" });

  useEffect(() => {
    const fetchCourt = async () => {
      try {
        const allCourts = await courtService.getAllCourts();
        const found = allCourts.success?.find((c) => c.Id === parseInt(courtId));
        if (found) {
          setCourt(found);

          // Set previews from existing images URLs
          setPreviews({
            Image1: found.Image1 || "",
            Image2: found.Image2 || "",
            Image3: found.Image3 || "",
          });
        } else {
          setCourt(null);
        }
      } catch (err) {
        setError("Failed to load court.");
      }
    };
    fetchCourt();
  }, [courtId]);

  const handleChange = (e) => {
    setCourt({ ...court, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setImages((prev) => ({ ...prev, [name]: files[0] }));

      const previewUrl = URL.createObjectURL(files[0]);
      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));
    }
  };

  // UPDATED handleSubmit: validates price, sends plain JS object with image URLs (not FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!court.PricePerHour) {
      alert("Price per hour is required.");
      setLoading(false);
      return;
    }

    try {
      // NOTE: If you want real image URLs, upload images before calling updateCourt and get URLs here.
      // For now, using previews (may be object URLs during edit, better to upload first).
      const imageUrls = [previews.Image1, previews.Image2, previews.Image3];

      const updatedData = {
        name: court.Name,
        location: court.Location,
        sport: court.Type,
        price: court.PricePerHour,
        email: court.Email || provider?.email,
        availability: court.Availability || [],
        description: court.Description,
        imageUrls,
        AvailableDate: court.AvailableDate,
        AvailableStartTime: court.AvailableStartTime,
        AvailableEndTime: court.AvailableEndTime,
      };

      const response = await courtService.updateCourt(courtId, updatedData);

      if (response.success) {
        alert("Court updated.");
        navigate("/manage-court");
      } else {
        alert("Failed to update court.");
      }
    } catch (err) {
      alert("Error while updating court.");
      console.error(err);
    } finally {
      setLoading(false);
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
        {/* Text Inputs */}
        <label className="editcourt-label" htmlFor="Name">Name</label>
        <input
          id="Name"
          name="Name"
          value={court.Name || ""}
          onChange={handleChange}
          placeholder="Court Name"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="Location">Location</label>
        <input
          id="Location"
          name="Location"
          value={court.Location || ""}
          onChange={handleChange}
          placeholder="Location"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="Type">Type</label>
        <input
          id="Type"
          name="Type"
          value={court.Type || ""}
          onChange={handleChange}
          placeholder="Sport Type"
          className="editcourt-input"
          required
        />

        <label className="editcourt-label" htmlFor="PricePerHour">Price Per Hour</label>
        <input
          id="PricePerHour"
          name="PricePerHour"
          type="number"
          min="0"
          value={court.PricePerHour || ""}
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
          value={court.Availability || ""}
          onChange={handleChange}
          placeholder="Availability"
          className="editcourt-input"
        />

        <label className="editcourt-label" htmlFor="Description">Description</label>
        <textarea
          id="Description"
          name="Description"
          value={court.Description || ""}
          onChange={handleChange}
          placeholder="Description"
          className="editcourt-input"
          rows={4}
        />

        {/* Image Uploads */}
        <label className="editcourt-label" htmlFor="Image1">Image 1</label>
        <input
          id="Image1"
          name="Image1"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="editcourt-input"
        />
        {previews.Image1 && (
          <img
            src={previews.Image1}
            alt="Preview 1"
            className="editcourt-image-preview"
          />
        )}

        <label className="editcourt-label" htmlFor="Image2">Image 2</label>
        <input
          id="Image2"
          name="Image2"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="editcourt-input"
        />
        {previews.Image2 && (
          <img
            src={previews.Image2}
            alt="Preview 2"
            className="editcourt-image-preview"
          />
        )}

        <label className="editcourt-label" htmlFor="Image3">Image 3</label>
        <input
          id="Image3"
          name="Image3"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="editcourt-input"
        />
        {previews.Image3 && (
          <img
            src={previews.Image3}
            alt="Preview 3"
            className="editcourt-image-preview"
          />
        )}

        <button type="submit" className="editcourt-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Court"}
        </button>

        <div className="mb-3" style={{ marginTop: "20px" }}>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Enter Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
          />
          <button
            className="btn btn-danger"
            onClick={handleBurnNFT}
            style={{ width: "100%", padding: "6px", fontSize: "14px" }}
            type="button"
          >
            Burn NFT
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourt;
