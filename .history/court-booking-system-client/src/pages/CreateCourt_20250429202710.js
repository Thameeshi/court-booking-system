// frontend/components/CreateCourt.js

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import courtService from "../services/domain-services/CourtService";
import XrplService from "../services/common-services/XrplService.ts";
import crypto from "crypto-browserify";

const CreateCourt = () => {
    const { userInfo, provider } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        ownerEmail: userInfo?.email || "",
    });

    const [courts, setCourts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchCourts = useCallback(async () => {
        try {
            const response = await courtService.getMyCourts(userInfo.email);
            if (response.success) {
                setCourts(response.success);
            }
        } catch (error) {
            console.error("Fetch courts error:", error);
        }
    }, [userInfo.email]);

    useEffect(() => {
        fetchCourts();
    }, [fetchCourts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const mintNFT = async (memoData) => {
        const rpc = new XrplService(provider);
        const hash = crypto.createHash("sha256").update(JSON.stringify(memoData)).digest("hex");
        const random = Math.floor(Math.random() * 1000);
        const uriData = `https://picsum.photos/seed/${random}${hash}/200/200`;

        const result = await rpc.mintNFT(memoData, uriData);
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
                price: formData.price,
            });

            const nftResult = await mintNFT(memoData);
            const nftURI = nftResult.result.tx_json.URI;

            const rpc = new XrplService(provider);
            const nfTokenID = await rpc.getNftFromUri(nftURI);
            const sellOffer = await rpc.createSellOffer(nfTokenID, formData.price, memoData, null);
            const txHash = sellOffer.result.tx_json.hash;
            const confirmed = await rpc.waitForConfirmation(txHash);
            const nfTokenSellOffer = confirmed.meta.offer_id;

            const payload = {
                ...formData,
                nfTokenID,
                nfTokenSellOffer,
            };

            const response = await courtService.createCourt(payload);

            if (response.success) {
                setSuccessMessage("Court added successfully!");
                fetchCourts();
                setFormData({
                    name: "",
                    description: "",
                    price: "",
                    ownerEmail: userInfo.email,
                });
            } else {
                setError("Failed to add court.");
            }
        } catch (err) {
            console.error("Court creation error:", err);
            setError("Something went wrong while adding the court.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Add New Court</h2>
            <form onSubmit={handleSubmit} className="card p-4">
                <input name="name" value={formData.name} onChange={handleInputChange} className="form-control mb-2" placeholder="Court Name" required />
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-control mb-2" placeholder="Description" required />
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="form-control mb-2" placeholder="Price per Hour" required />
                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? "Submitting..." : "Add Court"}</button>
                {error && <p className="text-danger mt-3">{error}</p>}
                {successMessage && <p className="text-success mt-3">{successMessage}</p>}
            </form>

            <h3 className="mt-5">My Courts</h3>
            <table className="table mt-3">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>NFT</th>
                        <th>Offer</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {courts.map((court) => (
                        <tr key={court.Id}>
                            <td>{court.Name}</td>
                            <td>{court.Description}</td>
                            <td>{court.Price}</td>
                            <td><a href={`https://test.xrplexplorer.com/en/nft/${court.NFTokenID}`} target="_blank" rel="noreferrer">View NFT</a></td>
                            <td><a href={`https://test.xrplexplorer.com/explorer/${court.NFTokenSellOffer}`} target="_blank" rel="noreferrer">View Offer</a></td>
                            <td>{court.BookingID ? "Booked" : "Available"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CreateCourt;
