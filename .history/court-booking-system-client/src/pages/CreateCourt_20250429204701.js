// backend/routes/court/createCourt.js

import express from "express";
import { CourtService } from "../../services/domain-services/CourtService.js";

const router = express.Router();

// Middleware to ensure reqId exists
function assignReqId(req, res, next) {
    req.reqId = req.reqId || Date.now().toString(); // or use UUID
    next();
}

router.post("/", assignReqId, async (req, res) => {
    const { name, location, type, availability, pricePerHour, ownerEmail } = req.body;

    // Validate required fields
    if (!name || !location || !type || !pricePerHour || !ownerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const courtService = new CourtService({ reqId: req.reqId });
        const result = await courtService.addCourt({
            name,
            location,
            type,
            availability,
            pricePerHour,
            ownerEmail,
        });

        if (result.success) {
            return res.status(201).json(result.success);
        } else {
            return res.status(500).json({ error: result.error });
        }
    } catch (err) {
        console.error("Create court failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
