import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import donationService from "../services/domain-services/DonationService.js";
import XrplService from "../services/common-services/XrplService.ts";

const ViewDonationRequests = () => {
    const { userInfo, provider } = useSelector((state) => state.auth);
    const [availableRequests, setAvailableRequests] = useState([]);
    const [myDonations, setMyDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [isLoadingDonations, setIsLoadingDonations] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchAvailableRequests = useCallback(async () => {
        setIsLoadingRequests(true);
        setAvailableRequests([]);
        try {
            console.log("all donation requests:", await donationService.getAllDonationRequests())
            const response = await donationService.getAvailableDonationRequests();
            if (response.success) {
                setAvailableRequests(response.success);
            }
        } catch (error) {
            console.error("Error fetching available donation requests:", error);
        } finally {
            setIsLoadingRequests(false);
        }
    }, []);

    const fetchMyDonations = useCallback(async () => {
        setIsLoadingDonations(true);
        setMyDonations([]);
        try {
            const response = await donationService.getMyDonations(userInfo.email);
            if (response.success) {
                setMyDonations(response.success);
            }
        } catch (error) {
            console.error("Error fetching my donations:", error);
        } finally {
            setIsLoadingDonations(false);
        }
    }, [userInfo.email]);

    useEffect(() => {
        fetchAvailableRequests();
        fetchMyDonations();
    }, [fetchAvailableRequests, fetchMyDonations]);

    const handleAcceptDonation = async (donationRequestID) => {
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const rpc = new XrplService(provider);
            const donationRequest = availableRequests.find(req => req.Id === donationRequestID);

            if (!donationRequest) {
                setError("Donation request not found.");
                return;
            }

            // Accept the NFT sell offer
            console.log("donationRequest.NFTokenSellOffer:", donationRequest.NFTokenSellOffer);
            const offerAcceptResult = await rpc.acceptSellOffer(donationRequest.NFTokenSellOffer);
            console.log("offerAcceptResult:", offerAcceptResult);
            if (offerAcceptResult.result.engine_result === "tesSUCCESS") {
                // Update the donation request with the donor's ID
                const acceptResponse = await donationService.acceptDonationRequest(userInfo.email, donationRequestID);
                console.log("acceptResponse:", acceptResponse);
                if (acceptResponse.success) {
                    setSuccessMessage("Donation processed successfully!");
                    fetchAvailableRequests();
                    fetchMyDonations();
                } else {
                    setError("Failed to process donation request.");
                }
            } else {
                setError("Failed to accept NFT sell offer.");
                console.error("Failed to accept NFT sell offer:", offerAcceptResult);
            }
        } catch (error) {
            console.error("Error accepting donation:", error);
            setError("An error occurred while accepting the donation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Active Donation Requests</h1>
            {isLoadingRequests ? (
                <div className="text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>) :
                availableRequests.length > 0 ? (
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>NFT</th>
                                <th>NFT Offer</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availableRequests.map((request) => (
                                <tr key={request.Id}>
                                    <td>{request.Name}</td>
                                    <td>{request.Description}</td>
                                    <td>{request.Amount}</td>
                                    <td>
                                        <a
                                            href={`https://test.xrplexplorer.com/en/nft/${request.NFTokenID}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            View NFT
                                        </a>
                                    </td>
                                    <td>
                                        <a
                                            href={`https://test.xrplexplorer.com/explorer/${request.NFTokenSellOffer}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            View Offer
                                        </a>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleAcceptDonation(request.Id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Accepting..." : "Accept"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-muted">No available donation requests found.</p>
                )}

            <h2 className="mt-5 mb-3">My Donations</h2>
            {isLoadingDonations ? (
                <div className="text-center mt-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : myDonations.length > 0 ? (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>NFT</th>
                            <th>NFT Offer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myDonations.map((donation) => (
                            <tr key={donation.Id}>
                                <td>{donation.Name}</td>
                                <td>{donation.Description}</td>
                                <td>{donation.Amount}</td>
                                <td>
                                    <a
                                        href={`https://test.xrplexplorer.com/en/nft/${donation.NFTokenID}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        View NFT
                                    </a>
                                </td>
                                <td>
                                    <a
                                        href={`https://test.xrplexplorer.com/explorer/${donation.NFTokenSellOffer}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        View Offer
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted">No donations found.</p>
            )}

            {error && <p className="text-danger mt-3">{error}</p>}
            {successMessage && <p className="text-success mt-3">{successMessage}</p>}
        </div>
    );
};

export default ViewDonationRequests;