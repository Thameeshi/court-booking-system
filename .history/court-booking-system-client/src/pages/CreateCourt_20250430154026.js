import courtService from "../services/domain-services/CourtService.js";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import XrplService from "../services/common-services/XrplService.ts";
import crypto from 'crypto-browserify';

const CreateCourt = () => {
    const { userInfo, provider } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        pricePerHour: "",
        location: "",
        type: "",
        availability: "Available",
        ownerEmail: userInfo.email || "",
        nfTokenID: "",
        nfTokenSellOffer: "",
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
            }
        } catch (error) {
            console.error("Error fetching courts:", error);
        }
    }, [userInfo.email]);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            ownerID: userInfo?.id || prevData.ownerID,
        }));
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
            if (!imageFile) {
                setError("Please upload a court image.");
                setIsLoading(false);
                return;
            }

            const memoData = JSON.stringify({
                name: formData.name,
                description: formData.description,
                price: formData.pricePerHour,
            });

            const nftResult = await mintNFT(memoData);
            const nftURI = nftResult.result.tx_json.URI;
            const rpc = new XrplService(provider);
            const NFTokenID = await rpc.getNftFromUri(nftURI);
            const sellOfferResponse = await rpc.createSellOffer(NFTokenID, formData.pricePerHour, memoData, null);
            const txHash = sellOfferResponse.result.tx_json.hash;
            const confirmedTx = await rpc.waitForConfirmation(txHash);
            const nfTokenSellOffer = confirmedTx.meta.offer_id;

            if (NFTokenID) {
                const formDataToSend = new FormData();
                formDataToSend.append("name", formData.name);
                formDataToSend.append("description", formData.description);
                formDataToSend.append("pricePerHour", formData.pricePerHour);
                formDataToSend.append("location", formData.location);
                formDataToSend.append("type", formData.type);
                formDataToSend.append("availability", formData.availability);
                formDataToSend.append("ownerEmail", formData.ownerEmail);
                formDataToSend.append("ownerID", formData.ownerID);
                {/*formDataToSend.append("nfTokenID", NFTokenID);
                formDataToSend.append("nfTokenSellOffer", nfTokenSellOffer);*/}
                formDataToSend.append("image", imageFile);

                const response = await courtService.addCourt(formDataToSend); // Should use multipart/form-data

                if (response.success) {
                    setSuccessMessage("Court added successfully!");
                    fetchCourts();
                } else {
                    setError("Failed to add court. Please try again.");
                }
            } else {
                setError("Failed to mint NFT.");
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
                    <label htmlFor="name" className="form-label">Court Name</label>
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
                    <label htmlFor="price" className="form-label">Hourly Price</label>
                    <input
                        type="text"
                        name="pricePerHour"
                        id="price"
                        value={formData.pricePerHour}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="type" className="form-label">Court Type</label>
                    <input
                        type="text"
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="availability" className="form-label">Availability</label>
                    <select
                        name="availability"
                        id="availability"
                        value={formData.availability}
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
                        name="image"
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

            <h2 className="mt-5 mb-3">My Courts</h2>
            {courts && courts.length > 0 ? (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>NFT</th>
                            <th>NFT Offer</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courts.map((court) => (
                            <tr key={court.Id}>
                                <td>{court.Name}</td>
                                <td>{court.Description}</td>
                                <td>{court.Price}</td>
                                <td>
                                    <a
                                        href={`https://test.xrplexplorer.com/en/nft/${court.NFTokenID}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        View NFT
                                    </a>
                                </td>
                                <td>
                                    <a
                                        href={`https://test.xrplexplorer.com/explorer/${court.NFTokenSellOffer}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        View Offer
                                    </a>
                                </td>
                                <td>
                                    {court.BookingID ? (
                                        <span className="badge rounded-pill bg-success">Booked</span>
                                    ) : (
                                        <span className="badge rounded-pill bg-warning">Available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-muted">No courts found.</p>
            )}
        </div>
    );
};

export default CreateCourt;
