import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

const ManageCourt = () => {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const ownerEmail = "hayeshahp6@gmail.com"; // Replace with the logged-in owner's email

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
        navigate(`/edit-court/${courtId}`);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Manage My Courts</h1>
            {loading && <p>Loading courts...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && courts.length === 0 && <p>No courts found.</p>}
            {!loading && courts.length > 0 && (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Price Per Hour</th>
                            <th>Availability</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courts.map((court) => (
                            <tr key={court.Id}>
                                <td>{court.Name}</td>
                                <td>{court.Location}</td>
                                <td>{court.Type}</td>
                                <td>{court.PricePerHour}</td>
                                <td>{court.Availability}</td>
                                <td>
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageCourt;
