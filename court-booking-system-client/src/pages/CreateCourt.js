import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";
import "../styles/CreateCourt.css";

const CreateCourt = () => {
  const [formData, setFormData] = useState({
    Name: "",
    description: "",
    PricePerHour: "",
    Location: "",
    Type: "",
    Availability: "Available",
    Email: "",
    Image: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, Image: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!formData.Image) {
        setError("Please upload a court image.");
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("Name", formData.Name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("PricePerHour", formData.PricePerHour);
      formDataToSend.append("Location", formData.Location);
      formDataToSend.append("Type", formData.Type);
      formDataToSend.append("Availability", formData.Availability);
      formDataToSend.append("Email", formData.Email);
      formDataToSend.append("Image", formData.Image);

      const response = await courtService.addCourt(formDataToSend);

      const newCourtId =
        response?.success?.courtId ||
        response?.court?._id ||
        response?.court?.Id ||
        response?.success?.Id;

      if (response?.success && newCourtId) {
        setSuccessMessage("Court added successfully!");
        navigate(`/dashboard/add-availability/${newCourtId}`);
      } else {
        setError("Failed to add court. Please try again.");
      }
    } catch (error) {
      setError(error.message || "An error occurred while adding the court.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="createcourt-page">
      <form
        onSubmit={handleSubmit}
        className="createcourt-form"
        encType="multipart/form-data"
      >
        <h1>Add New Court</h1>

        <label htmlFor="Name" className="createcourt-label">
          Court Name
        </label>
        <input
          type="text"
          name="Name"
          id="Name"
          value={formData.Name}
          onChange={handleInputChange}
          className="createcourt-input"
          required
        />

        <label htmlFor="description" className="createcourt-label">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          className="createcourt-textarea"
          rows={4}
          required
        />

        <label htmlFor="PricePerHour" className="createcourt-label">
          Hourly Price
        </label>
        <input
          type="text"
          name="PricePerHour"
          id="PricePerHour"
          value={formData.PricePerHour}
          onChange={handleInputChange}
          className="createcourt-input"
          required
        />

        <label htmlFor="Location" className="createcourt-label">
          Location
        </label>
        <input
          type="text"
          name="Location"
          id="Location"
          value={formData.Location}
          onChange={handleInputChange}
          className="createcourt-input"
          required
        />

        <label htmlFor="Type" className="createcourt-label">
          Court Type
        </label>
        <input
          type="text"
          name="Type"
          id="Type"
          value={formData.Type}
          onChange={handleInputChange}
          className="createcourt-input"
          required
        />

        <label htmlFor="Availability" className="createcourt-label">
          Availability
        </label>
        <select
          name="Availability"
          id="Availability"
          value={formData.Availability}
          onChange={handleInputChange}
          className="createcourt-select"
          required
        >
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <label htmlFor="Email" className="createcourt-label">
          Email
        </label>
        <input
          type="email"
          name="Email"
          id="Email"
          value={formData.Email}
          onChange={handleInputChange}
          className="createcourt-input"
          required
        />

        <label htmlFor="image" className="createcourt-label">
          Court Image
        </label>
        <input
          type="file"
          id="image"
          name="Image"
          className="createcourt-input"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        <button
          type="submit"
          className="createcourt-button"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Court"}
        </button>

        {error && <p className="createcourt-error">{error}</p>}
        {successMessage && (
          <p className="createcourt-success">{successMessage}</p>
        )}
      </form>
    </div>
  );
};

export default CreateCourt;
