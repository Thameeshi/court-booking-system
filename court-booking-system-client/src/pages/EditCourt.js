import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import courtService from "../services/domain-services/CourtService";

const EditCourt = () => {
    const { courtId } = useParams();
    const navigate = useNavigate();
    const [court, setCourt] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCourt = async () => {
            try {
                const allCourts = await courtService.getAllCourts();
                const found = allCourts.success?.find(c => c.Id === parseInt(courtId));
                setCourt(found || null);
            } catch (err) {
                setError("Failed to load court.");
            }
        };
        fetchCourt();
    }, [courtId]);

    const handleChange = (e) => {
        setCourt({ ...court, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await courtService.editCourt(courtId, court);
            if (response.success) {
                alert("Court updated.");
                navigate("/manage-court");
            } else {
                alert("Failed to update.");
            }
        } catch (err) {
            alert("Error while updating court.");
        }
    };

    if (!court) return <p>Loading...</p>;

    return (
        <div className="container mt-4">
            <h2>Edit Court</h2>
            <form onSubmit={handleSubmit}>
                <input name="Name" value={court.Name} onChange={handleChange} placeholder="Name" className="form-control mb-2" />
                <input name="Location" value={court.Location} onChange={handleChange} placeholder="Location" className="form-control mb-2" />
                <input name="Type" value={court.Type} onChange={handleChange} placeholder="Type" className="form-control mb-2" />
                <input name="PricePerHour" value={court.PricePerHour} onChange={handleChange} placeholder="Price" className="form-control mb-2" />
                
                <div className="mb-2">
                    <label htmlFor="AvailableDate" className="form-label">Available Date</label>
                    <input 
                        type="date" 
                        name="AvailableDate" 
                        id="AvailableDate"
                        value={court.AvailableDate || ""} 
                        onChange={handleChange} 
                        className="form-control" 
                    />
                </div>
                
                <div className="mb-2">
                    <label htmlFor="AvailableStartTime" className="form-label">Available Start Time</label>
                    <input 
                        type="time" 
                        name="AvailableStartTime" 
                        id="AvailableStartTime"
                        value={court.AvailableStartTime || ""} 
                        onChange={handleChange} 
                        className="form-control" 
                    />
                </div>
                
                <div className="mb-2">
                    <label htmlFor="AvailableEndTime" className="form-label">Available End Time</label>
                    <input 
                        type="time" 
                        name="AvailableEndTime" 
                        id="AvailableEndTime"
                        value={court.AvailableEndTime || ""} 
                        onChange={handleChange} 
                        className="form-control" 
                    />
                </div>
                
                <input name="Availability" value={court.Availability} onChange={handleChange} placeholder="Availability" className="form-control mb-2" />
                <button type="submit" className="btn btn-success">Update Court</button>
            </form>
        </div>
    );
};

export default EditCourt;
