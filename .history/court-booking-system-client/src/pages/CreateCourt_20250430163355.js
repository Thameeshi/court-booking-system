import courtService from "../services/domain-services/CourtService.js";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";
import crypto from 'crypto-browserify';

const CreateCourt = () => {
    const { userInfo, provider } = useSelector((state) => state.auth);
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

    const mintNFT = async (memoData) => {
        if (!provider) {
            console.log("Provider not initialized yet");
            return;
        }
        const rpc = new XrplService(provider);
        const hash = crypto.createHash('sha256').update(JSON.stringify(memoData)).digest('hex');
        let random = Math.floor(Math.random() * 1000);
        let uriData = `https://picsum.photos/seed/${random}${hash}/200/200`;

        const result = await rpc.mintNFT(memoData, uriData);
        console.log("Mint result:", result);
        return result;
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

            const memoData = JSON.stringify({
                name: formData.Name,
                description: formData.description,
                price: formData.PricePerHour,
            });

            console.log("Minting NFT...");
            const nftResult = await mintNFT(memoData);
            console.log("NFT Result:", nftResult);

            if (!nftResult || !nftResult.result || !nftResult.result.tx_json || !nftResult.result.tx_json.URI) {
                setError("Failed to mint NFT.");
                setIsLoading(false);
                return;
            }

            const nftURI = nftResult.result.tx_json.URI;
            console.log("NFT URI:", nftURI);

            const rpc = new XrplService(provider);
            const NFTokenID = await rpc.getNftFromUri(nftURI);
            console.log("NFTokenID:", NFTokenID);

            if (!NFTokenID) {
                setError("Failed to retrieve NFTokenID.");
                setIsLoading(false);
                return;
            }

            const sellOfferResponse = await rpc.createSellOffer(NFTokenID, formData.PricePerHour, memoData, null);
            console.log("Sell Offer Response:", sellOfferResponse);

            const txHash = sellOfferResponse.result.tx_json.hash;
            console.log("Transaction Hash:", txHash);

            const confirmedTx = await rpc.waitForConfirmation(txHash);
            console.log("Confirmed Transaction:", confirmedTx);

            const nfTokenSellOffer = confirmedTx.meta.offer_id;
            console.log("NFToken Sell Offer:", nfTokenSellOffer);

            const formDataToSend = new FormData();
            formDataToSend.append("Name", formData.Name);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("PricePerHour", formData.PricePerHour);
            formDataToSend.append("Location", formData.Location);
            formDataToSend.append("Type", formData.Type);
            formDataToSend.append("Availability", formData.Availability);
            formDataToSend.append("Email", formData.Email);
            formDataToSend.append("Image", imageFile);

            console.log("Sending court data to backend...");
            const response = await courtService.addCourt(formDataToSend);
            console.log("Add Court Response:", response);

            if (response.success) {
                setSuccessMessage("Court added successfully!");
                fetchCourts();
            } else {
                setError("Failed to add court. Please try again.");
            }
        } catch (error) {
            console.error("Error creating court:", error);
            setError("An error occurred while adding the court.");
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
