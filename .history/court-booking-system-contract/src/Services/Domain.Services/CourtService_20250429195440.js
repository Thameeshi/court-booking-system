import { Tables } from "../data/Tables.js";
import { dbService } from "./DatabaseService.js";

export class CourtService {
    async addCourt(data) {
        const courtEntity = {
            name: data.name,
            location: data.location,
            type: data.type,
            availability: data.availability,
            pricePerHour: data.pricePerHour,
            ownerEmail: data.ownerEmail
        };

        try {
            const result = await dbService.insert(Tables.COURT, courtEntity);
            return { status: "success", data: result };
        } catch (err) {
            return { status: "error", message: err.message };
        }
    }

    async getCourtByOwner(email) {
        try {
            const result = await dbService.find(Tables.COURT, { ownerEmail: email });
            return { status: "success", data: result };
        } catch (err) {
            return { status: "error", message: err.message };
        }
    }

    async editCourt(id, data) {
        const updateData = {
            name: data.name,
            location: data.location,
            type: data.type,
            availability: data.availability,
            pricePerHour: data.pricePerHour
        };

        try {
            const result = await dbService.updateById(Tables.COURT, id, updateData);
            return { status: "success", data: result };
        } catch (err) {
            return { status: "error", message: err.message };
        }
    }

    async deleteCourt(id) {
        try {
            const result = await dbService.deleteById(Tables.COURT, id);
            return { status: "success", data: result };
        } catch (err) {
            return { status: "error", message: err.message };
        }
    }

    async getAllCourts() {
        try {
            const result = await dbService.findAll(Tables.COURT);
            return { status: "success", data: result };
        } catch (err) {
            return { status: "error", message: err.message };
        }
    }
}