import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

// CreateCourt component allows users to add a new court, including uploading an image file.
const CreateCourt = () => {
    // State for form fields
    const [formData, setFormData] = useState({
        Name: "",
        description: "",
        PricePerHour: "",
        Location: "",
        Type: "",
        Availability: "Available",
        Email: "",
        Image: null
    });

    // State for UI feedback
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({
                ...prevData,
                Image: file
            }));
        }
    };

    // Handle form submission, including sending the image as FormData
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

            // Prepare FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append("Name", formData.Name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("PricePerHour", formData.PricePerHour);
            formDataToSend.append("Location", formData.Location);
            formDataToSend.append("Type", formData.Type);
            formDataToSend.append("Availability", formData.Availability);
            formDataToSend.append("Email", formData.Email);
            formDataToSend.append("Image", formData.Image); // Image file is sent here

            // Send the form data to the backend
            const response = await courtService.addCourt(formDataToSend);
            console.log("Add Court Response:", response);

            // Extract the new court's ID from the backend response
            const newCourtId =
                response?.success?.courtId ||
                response?.court?._id ||
                response?.court?.Id ||
                response?.success?.Id;

            console.log("Extracted newCourtId:", newCourtId);

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

    // Render the form UI
    return (
        <div className="container mt-5">
            <h1 className="mb-4">Add New Court</h1>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm" encType="multipart/form-data">
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">Court Name</label>
                    <input
                        type="text"
                        name="Name"
                        id="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="PricePerHour" className="form-label">Hourly Price</label>
                    <input
                        type="text"
                        name="PricePerHour"
                        id="PricePerHour"
                        value={formData.PricePerHour}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="Location" className="form-label">Location</label>
                    <input
                        type="text"
                        name="Location"
                        id="Location"
                        value={formData.Location}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="Type" className="form-label">Court Type</label>
                    <input
                        type="text"
                        name="Type"
                        id="Type"
                        value={formData.Type}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="Availability" className="form-label">Availability</label>
                    <select
                        name="Availability"
                        id="Availability"
                        value={formData.Availability}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                    >
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="Email" className="form-label">Email</label>
                    <input
                        type="email"
                        name="Email"
                        id="Email"
                        value={formData.Email}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="image" className="form-label">Court Image</label>
                    <input
                        type="file"
                        id="image"
                        name="Image"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Court"}
                </button>
                {error && <p className="text-danger mt-3">{error}</p>}
                {successMessage && <p className="text-success mt-3">{successMessage}</p>}
            </form>
        </div>
    );
};

export default CreateCourt;
