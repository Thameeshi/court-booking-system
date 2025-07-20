import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

const ManageCourt = () => {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const ownerEmail = process.env.USER_EMAIL; // Replace with the logged-in owner's email

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                const response = await courtService.getCourtByOwner(ownerEmail);
                if (response.success) {
                    setCourts(response.success);
                } else {
                    setError("Failed to fetch courts.");
                }
            } catch (err) {
                setError(err.message || "An error occurred while fetching courts.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [ownerEmail]);

    const handleDelete = async (courtId) => {
        if (!window.confirm("Are you sure you want to delete this court?")) return;

        try {
            const response = await courtService.deleteCourt(courtId);
            if (response.success) {
                setCourts(courts.filter((court) => court.Id !== courtId));
                alert("Court deleted successfully.");
            } else {
                alert("Failed to delete court.");
            }
        } catch (err) {
            alert(err.message || "An error occurred while deleting the court.");
        }
    };

    const navigate = useNavigate();

    const handleEdit = (courtId) => {
        navigate(`/dashboard/edit-court/${courtId}`);
    };

    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Manage My Courts</h1>
            {loading && <p>Loading courts...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && courts.length === 0 && <p>No courts found.</p>}
            {!loading && courts.length > 0 && (
                <div className="row">
                    {courts.map((court) => (
                        <div className="col-md-4 mb-4" key={court.Id}>
                            <div className="card">
                                <img
                                    src={court.Image} // Use Cloudinary URL directly
                                    alt={court.Name}
                                    className="card-img-top"
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{court.Name}</h5>
                                    <p className="card-text">
                                        <strong>Location:</strong> {court.Location} <br />
                                        <strong>Type:</strong> {court.Type} <br />
                                        <strong>Price Per Hour:</strong> ${court.PricePerHour} <br />
                                        <strong>Availability:</strong> {court.Availability} <br />
                                        {/* Display new fields */}
                                        <strong>Available Date:</strong> {formatDate(court.AvailableDate)} <br />
                                        <strong>Available Time:</strong> {court.AvailableStartTime || "Not set"} - {court.AvailableEndTime || "Not set"}
                                    </p>
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => handleEdit(court.Id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(court.Id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageCourt;
