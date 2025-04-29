import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { courtService } from "../services/domain-services/CourtService"; // Corrected import


const ViewCourtBookingRequests = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [availableCourts, setAvailableCourts] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchAvailableCourts = useCallback(async () => {
        setIsLoadingRequests(true);
        setAvailableCourts([]);
        try {
            const response = await courtService.getAvailableCourts(); // Fetch available courts
            if (response.success) {
                setAvailableCourts(response.success);
            }
        } catch (error) {
            console.error("Error fetching available courts:", error);
        } finally {
            setIsLoadingRequests(false);
        }
    }, []);

    const fetchMyBookings = useCallback(async () => {
        setIsLoadingBookings(true);
        setMyBookings([]);
        try {
            const response = await courtService.getMyBookings(userInfo.email);  // Fetch my court bookings
            if (response.success) {
                setMyBookings(response.success);
            }
        } catch (error) {
            console.error("Error fetching my bookings:", error);
        } finally {
            setIsLoadingBookings(false);
        }
    }, [userInfo.email]);

    useEffect(() => {
        fetchAvailableCourts();
        fetchMyBookings();
    }, [fetchAvailableCourts, fetchMyBookings]);

    const handleAcceptBooking = async (courtRequestID) => {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const courtRequest = availableCourts.find(req => req.Id === courtRequestID);

            if (!courtRequest) {
                setError("Court booking request not found.");
                return;
            }

            // Accept the court booking
            const acceptResponse = await courtService.acceptCourtBooking(userInfo.email, courtRequestID);
            if (acceptResponse.success) {
                setSuccessMessage("Court booking confirmed successfully!");
                fetchAvailableCourts();
                fetchMyBookings();
            } else {
                setError("Failed to confirm court booking.");
            }
        } catch (error) {
            console.error("Error confirming court booking:", error);
            setError("An error occurred while confirming the court booking.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Available Court Bookings</h1>
            {isLoadingRequests ? (
                <div className="text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>) :
                availableCourts.length > 0 ? (
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Court Name</th>
                                <th>Location</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableCourts.map((request) => (
                                <tr key={request.Id}>
                                    <td>{request.CourtName}</td>
                                    <td>{request.Location}</td>
                                    <td>{request.Date}</td>
                                    <td>{request.Time}</td>
                                    <td>{request.Price}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleAcceptBooking(request.Id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Confirming..." : "Confirm Booking"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-muted">No available court bookings found.</p>
                )}

            <h2 className="mt-5 mb-3">My Court Bookings</h2>
            {isLoadingBookings ? (
                <div className="text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : myBookings.length > 0 ? (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Court Name</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myBookings.map((booking) => (
                            <tr key={booking.Id}>
                                <td>{booking.CourtName}</td>
                                <td>{booking.Location}</td>
                                <td>{booking.Date}</td>
                                <td>{booking.Time}</td>
                                <td>{booking.Price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted">No court bookings found.</p>
            )}

            {error && <p className="text-danger mt-3">{error}</p>}
            {successMessage && <p className="text-success mt-3">{successMessage}</p>}
        </div>
    );
};

export default ViewCourtBookingRequests;