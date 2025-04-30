import courtService from "../services/domain-services/CourtService.js";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

const CreateCourt = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        Name: "",
        description: "",
        PricePerHour: "",
        Location: "",
        Type: "",
        Availability: "Available",
        Email: userInfo.email || "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [courts, setCourts] = useState([]);

    const fetchCourts = useCallback(async () => {
        try {
            const response = await courtService.getMyCourts(userInfo.email);
            if (response.success) {
                setCourts(response.success);
            } else {
                console.error("Failed to fetch courts:", response.error);
            }
        } catch (error) {
            console.error("Error fetching courts:", error);
        }
    }, [userInfo.email]);

    useEffect(() => {
        fetchCourts();
    }, [userInfo, fetchCourts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
        if (!imageFile) {
            setError("Please upload a court image.");
            setIsLoading(false);
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) { // 5 MB limit
            setError("File size must be less than 5 MB.");
            setIsLoading(false);
            return;
        }

        const courtData = {
            Name: formData.Name,
            description: formData.description,
            PricePerHour: formData.PricePerHour,
            Location: formData.Location,
            Type: formData.Type,
            Availability: formData.Availability,
            Email: formData.Email,
        };

        console.log("Court Data to send:", courtData);

        const message = {
            type: "Court",
            subType: "addCourt",
            data: { courtData },
            reqId: "unique-request-id", // Generate a unique request ID
        };

        const response = await courtService.sendMessage(message);

        console.log("Add Court Response:", response);

        if (response.success) {
            setSuccessMessage("Court added successfully!");
            fetchCourts();
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
                        onChange={(e) => setImageFile(e.target.files[0])}
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
