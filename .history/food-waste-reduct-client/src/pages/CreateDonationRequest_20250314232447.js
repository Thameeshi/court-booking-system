import donationService from "../services/domain-services/DonationService.js";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";
import crypto from '../crypto-browserify';

const CreateDonationRequest = () => {
    const { userInfo, provider } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        amount: "",
        foodReceiverEmail: userInfo.email || "",
        nfTokenID: "",
        nfTokenSellOffer: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [donationRequests, setDonationRequests] = useState([]);

    const fetchDonationRequests = useCallback(async () => {
        try {
            console.log(await donationService.getAllDonationRequests())
            const response = await donationService.getMyDonationRequests(userInfo.email);

            if (response.success) {
                setDonationRequests(response.success);
            }
        } catch (error) {
            console.error("Error fetching donation requests:", error);
        }
    }, [userInfo.email]);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            foodReceiverID: userInfo?.id || prevData.foodReceiverID,
        }));
        fetchDonationRequests();
    }, [userInfo, fetchDonationRequests]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const mintNFT = async (memoData) => {
        if (!provider) {
            console.log("provider not initialized yet");
            return;
        }
        const rpc = new XrplService(provider);
        const hash = crypto.createHash('sha256').update(JSON.stringify(memoData)).digest('hex');
        let random = Math.floor(Math.random() * 1000);
        let uriData = `https://picsum.photos/seed/${random}${hash}/200/200`;

        const result = await rpc.mintNFT(memoData, uriData);
        console.log("mint result:", result);
        return result;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const memoData = JSON.stringify({
                name: formData.name,
                description: formData.description,
                amount: formData.amount,
            });
            const nftResult = await mintNFT(memoData);

            const nftURI = nftResult.result.tx_json.URI;
            const rpc = new XrplService(provider);
            const NFTokenID = await rpc.getNftFromUri(nftURI);

            console.log("found minted NFTokenID:", NFTokenID);

            const sellOfferResponse = await rpc.createSellOffer(NFTokenID, formData.amount, memoData, null);
            const txHash = sellOfferResponse.result.tx_json.hash;

            // Wait for transaction validation
            const confirmedTx = await rpc.waitForConfirmation(txHash);
            console.log("confirmedTx:", confirmedTx);

            // Extract offer from metadata
            const nfTokenSellOffer = confirmedTx.meta.offer_id;
            if (NFTokenID) {
                const updatedFormData = {
                    ...formData,
                    nfTokenID: NFTokenID,
                    nfTokenSellOffer: nfTokenSellOffer,
                };

                const response = await donationService.createDonationRequest(updatedFormData);
                if (response.success) {
                    setSuccessMessage("Donation request created successfully!");
                    fetchDonationRequests(); // Refresh list after creation
                } else {
                    setError("Failed to create donation request. Please try again.");
                }
            } else {
                setError("Failed to mint NFT.");
            }
        } catch (error) {
            console.error("Error creating donation request:", error);
            setError("An error occurred while creating the donation request.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Create Donation Request</h1>
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
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
                    <label htmlFor="amount" className="form-label">Amount</label>
                    <input
                        type="text"
                        name="amount"
                        id="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Request"}
                </button>
                {error && <p className="text-danger mt-3">{error}</p>}
                {successMessage && <p className="text-success mt-3">{successMessage}</p>}
            </form>

            <h2 className="mt-5 mb-3">My Donation Requests</h2>
            {donationRequests && donationRequests.length > 0 ? (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>NFT</th>
                            <th>NFT Offer</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donationRequests.map((request) => (
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
                                    {request.DonorID ? (
                                        <span className="badge rounded-pill bg-success">Donation Received</span>
                                    ) : (
                                        <span className="badge rounded-pill bg-warning">Active Request</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted">No donation requests found.</p>
            )}
        </div>
    );
};

export default CreateDonationRequest;