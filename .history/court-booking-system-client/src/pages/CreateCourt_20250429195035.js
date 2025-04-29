import React, { useState } from 'react';
import { courtService } from "../services/CourtService";
import { XrplService } from "../services/xrplService";

const CreateCourt = () => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        type: '',
        availability: '',
        pricePerHour: '',
        ownerEmail: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mint NFT
        const xrplService = new XrplService();
        const nftResponse = await xrplService.mintCourtNft(formData.name, formData.pricePerHour);

        if (nftResponse && nftResponse.status === 'success') {
            console.log("NFT minted:", nftResponse.result);

            // Proceed to create court
            const response = await courtService.addCourt(formData);
            console.log("Court creation response:", response);
        } else {
            console.error("NFT minting failed");
        }
    };

    return (
        <div>
            <h2>Create Court</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Court Name" value={formData.name} onChange={handleChange} required />
                <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
                <input type="text" name="type" placeholder="Court Type" value={formData.type} onChange={handleChange} required />
                <input type="text" name="availability" placeholder="Availability" value={formData.availability} onChange={handleChange} required />
                <input type="number" name="pricePerHour" placeholder="Price Per Hour" value={formData.pricePerHour} onChange={handleChange} required />
                <input type="email" name="ownerEmail" placeholder="Owner Email" value={formData.ownerEmail} onChange={handleChange} required />
                <button type="submit">Create Court</button>
            </form>
        </div>
    );
};

export default CreateCourt;