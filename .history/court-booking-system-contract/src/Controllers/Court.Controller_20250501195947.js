import { CourtService } from "../Services/Domain.Services/CourtService";

export class CourtController {
    #message = null;
    #service = null;

    constructor(message) {
        this.#message = message;
        this.#service = new CourtService(message);
    }

    async handleRequest() {
        try {
            console.log("Handling Court request with subType:", this.#message.subType);

            switch (this.#message.subType) {
                case "addCourt":
                    if (!this.#message.data || Object.keys(this.#message.data).length === 0) {
                        return { error: "Invalid request. Data object is empty or missing.", request: this.#message };
                    }
                    return await this.#service.addCourt(this.#message.data);

                case "editCourt":
                    if (!this.#message.data || !this.#message.data.courtId || !this.#message.data.updatedData) {
                        return { error: "Missing courtId or updatedData in request." };
                    }
                    return await this.#service.editCourt(this.#message.data.courtId, this.#message.data.updatedData);

                case "deleteCourt":
                    if (!this.#message.data || !this.#message.data.courtId) {
                        return { error: "Missing courtId in request." };
                    }
                    return await this.#service.deleteCourt(this.#message.data.courtId);

                case "getAllCourts":
                    return await this.#service.getAllCourts();

                case "getCourtsByOwner":
                    if (!this.#message.data || !this.#message.data.email) {
                        return { error: "Missing owner email in request." };
                    }
                    return await this.#service.getCourtByOwner(this.#message.data.email);

                default:
                    console.error("Invalid subType:", this.#message.subType);
                    return { error: "Invalid request subType.", request: this.#message };
            }
        } catch (error) {
            console.error("Error in CourtController:", error);
            return { error: error.message || "An unexpected error occurred.", request: this.#message };
        }
    }
}