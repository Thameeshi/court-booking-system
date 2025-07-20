import express from "express";
import multer from "multer";
import { storage } from "../Config/cloudinaryConfig.js";
import { CourtService } from "../Services/Domain.Services/CourtService.js";

const router = express.Router();
const upload = multer({ storage });

router.post('/api/courts', upload.single('Image'), async (req, res) => {
    try {
        const imageUrl = req.file ? req.file.path : null;
        const courtData = {
            Name: req.body.Name,
            description: req.body.description,
            PricePerHour: req.body.PricePerHour,
            Location: req.body.Location,
            Type: req.body.Type,
            Availability: req.body.Availability,
            Email: req.body.Email,
            Image: imageUrl,
        };
        const message = { reqId: Date.now() };
        const courtService = new CourtService(message);
        const result = await courtService.addCourt(courtData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || "Error adding court" });
    }
});

export default router;