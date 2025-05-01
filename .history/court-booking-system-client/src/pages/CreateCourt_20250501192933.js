import React, { useState } from "react";
import courtService from "../services/domain-services/CourtService";

const CreateCourt = () => {
    const [formData, setFormData] = useState({
        Name: "",
        description: "",
        PricePerHour: "",
        Location: "",
        Type: "",
        Availability: "Available",
        Email: "",
        Image: null, // Added Image field to formData
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
    
        if (file) {
            // Only save the file name to the form data, actual file upload handled differently
            setFormData(prevData => ({
                ...prevData,
                Image: file.name // Just the file name
            }));
    
            // Save file to local file system or another channel if needed
            // Depends on how you’ve configured HotPocket contract's FS
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

            if (formData.Image.size > 5 * 1024 * 1024) { // 5 MB limit
                setError("File size must be less than 5 MB.");
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
            formDataToSend.append("Image", formData.Image); // Include the Image file

            console.log("Sending court data to backend...");

            const response = await courtService.addCourt(formDataToSend);

            console.log("Add Court Response:", response);

            if (response.success) {
                setSuccessMessage("Court added successfully!");
                setFormData({
                    Name: "",
                    description: "",
                    PricePerHour: "",
                    Location: "",
                    Type: "",
                    Availability: "Available",
                    Email: "",
                    Image: null, // Reset Image field
                });
            } else {
                setError("Failed to add court. Please try again.");
            }
        } catch (error) {
            console.error("Error creating court:", error);
            setError(error.message || "An error occurred while adding the court.");
        } finally {
            setIsLoading(false);
        }
    };

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
