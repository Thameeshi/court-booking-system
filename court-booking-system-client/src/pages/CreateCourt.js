import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CreateCourt.css";

const CreateCourt = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [sport, setSport] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [moreDetails, setMoreDetails] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "hayeshahp6@gmail.com";

  const handleImageUpload = async () => {
    if (!images.length) throw new Error("No images selected");

    const uploadedUrls = [];

    for (let i = 0; i < images.length && i < 3; i++) {
      const formData = new FormData();
      formData.append("file", images[i]);
      formData.append("upload_preset", "easycourt_upload");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dhrejmsev/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          "Image upload failed: " +
            (errorData.error?.message || response.statusText)
        );
      }

      const data = await response.json();
      uploadedUrls.push(data.secure_url);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!images.length) {
        alert("Please select up to 3 images.");
        setLoading(false);
        return;
      }

      const imageUrls = await handleImageUpload();

      const courtData = {
        name,
        location,
        sport,
        price,
        email: userEmail,
        moreDetails,
        availability,
        imageUrls, // Send all 3 image URLs as an array
      };

      const result = await courtService.addCourt(courtData);

      if (result?.success) {
        alert("Court added successfully!");
        navigate(`/dashboard/add-availability/${result.success.courtId}`);
      } else {
        alert("Failed to add court: " + (result?.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-court">
      <form onSubmit={handleSubmit}>
        <h2>Create Court</h2>
        <input
          placeholder="Court Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          placeholder="Sport"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          required
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <textarea
          placeholder="More Details"
          value={moreDetails}
          onChange={(e) => setMoreDetails(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))}
          required
        />

        {images.length > 0 && (
          <div className="image-preview">
            {images.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt={`preview-${index}`}
                style={{ width: "100px", marginRight: "10px" }}
              />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Add Court"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourt;
