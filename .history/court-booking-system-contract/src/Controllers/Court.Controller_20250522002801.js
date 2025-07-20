// This controller is for message-based (not HTTP/Express) backend logic.
// To support Cloudinary uploads, you need to handle image uploads in your HTTP API layer (e.g., Express routes).
// However, you can update this controller to expect the Cloudinary image URL in the data.Image field.

import { CourtService } from "../Services/Domain.Services/CourtService.js";
import { BookingService } from "../Services/Domain.Services/BookingService.js";

// --- Message-based controller class ---
export class CourtController {
    #message = null;
    #service = null;
    #bookingService = null;

    constructor(message) {
        this.#message = message;
        this.#service = new CourtService(message);
        this.#bookingService = new BookingService(message);
        console.log("[CourtController] Services initialized.");
    }

    async handleRequest() {
        try {
            const subType = this.#message?.subType;
            const data = this.#message?.data;

            console.log("[CourtController] Received subType:", subType);

            switch (subType) {
                // COURT MANAGEMENT
                case "addCourt":
                    // Expect data.Image to be a Cloudinary URL (set by your HTTP API route)
                    if (!data || Object.keys(data).length === 0) {
                        return { error: "Data for court is missing.", request: this.#message };
                    }
                    // data.Image should be a Cloudinary URL string
                    return await this.#service.addCourt(data);

                case "editCourt":
                    if (!data?.courtId || !data?.updatedData) {
                        return { error: "Missing 'courtId' or 'updatedData'." };
                    }
                    return await this.#service.editCourt(data.courtId, data.updatedData);

                case "deleteCourt":
                    if (!data?.courtId) {
                        return { error: "Missing 'courtId'." };
                    }
                    return await this.#service.deleteCourt(data.courtId);

                case "getAllCourts":
                    return await this.#service.getAllCourts();

                case "getCourtByOwner":
                    if (!data?.email) {
                        return { error: "Missing owner email." };
                    }
                    return await this.#service.getCourtByOwner(data.email);

                // NEW: ADD AVAILABILITY
                case "addAvailability":
                    if (!data?.courtId || !data?.AvailableDate || !data?.AvailableStartTime || !data?.AvailableEndTime) {
                        return { error: "Missing required fields for availability (courtId, AvailableDate, AvailableStartTime, AvailableEndTime)." };
                    }
                    return await this.#service.addAvailability(data);

                // BOOKING MANAGEMENT
                case "createBooking":
                    if (!data?.CourtId || !data?.UserEmail || !data?.Date || !data?.StartTime || !data?.EndTime) {
                        return { error: "Missing required booking fields (CourtId, UserEmail, Date, StartTime, EndTime)." };
                    }
                    return await this.#bookingService.createBooking(data);

                case "getUserBookings":
                    if (!data?.UserEmail) {
                        return { error: "Missing 'UserEmail' for booking retrieval." };
                    }
                    return await this.#bookingService.getUserBookings(data.UserEmail);

                default:
                    console.error("[CourtController] Invalid subType received:", subType);
                    return {
                        error: "Invalid request subType.",
                        request: this.#message
                    };
            }
        } catch (err) {
            console.error("[CourtController] Error:", err);
            return {
                error: err.message || "An unexpected error occurred.",
                request: this.#message
            };
        }
    }
}

// --- HTTP API route for Cloudinary image upload and court creation ---

import express from "express";
import multer from "multer";
import { storage } from "../Config/cloudinaryConfig.js";
import { CourtService as CourtServiceForRoute } from "../Services/Domain.Services/CourtService.js";

const router = express.Router();
const upload = multer({ storage });

// Make sure the field name 'Image' matches your frontend FormData key
router.post('/api/courts', upload.single('Image'), async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.path : null;
        // Collect other fields from req.body
        const courtData = {
            Name: req.body.Name,
            description: req.body.description,
            PricePerHour: req.body.PricePerHour,
            Location: req.body.Location,
            Type: req.body.Type,
            Availability: req.body.Availability,
            Email: req.body.Email,
            Image: imageUrl, // Cloudinary URL
            // Add other fields as needed
        };

        // Create a dummy message object for service (if needed)
        const message = { reqId: Date.now() };
        const courtService = new CourtServiceForRoute(message);

        const result = await courtService.addCourt(courtData);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || "Error adding court" });
    }
});

export default router;