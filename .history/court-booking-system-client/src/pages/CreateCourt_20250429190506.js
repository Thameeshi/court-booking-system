import React, { useState, useEffect } from "react";
import courtService from "../services/CourtService";

const CreateCourt = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    type: "",
    price: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const walletAddress = window.sessionStorage.getItem("walletAddress");
      const userName = window.sessionStorage.getItem("userName");

      const updatedFormData = {
        ...formData,
        walletAddress,
        userName,
      };

      const response = await courtService.addCourt(updatedFormData);

      if (response && response.data) {
        setSuccessMessage("Court added successfully!");
        setFormData({
          name: "",
          description: "",
          location: "",
          type: "",
          price: "",
        });
      }
    } catch (error) {
      console.error("Error creating court:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="container">
      <h1>Add New Court</h1>
      {successMessage && <p className="text-success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Court Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Court Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="type"
          placeholder="Court Type (e.g. Tennis)"
          value={formData.type}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Add Court"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourt;