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
                    if (!this.#message.data.courtId) {
                        return { error: "Invalid request. Missing courtId.", request: this.#message };
                    }
                    return await this.#service.editCourt(this.#message.data.courtId, this.#message.data);

                case "deleteCourt":
                    if (!this.#message.data.courtId) {
                        return { error: "Invalid request. Missing courtId.", request: this.#message };
                    }
                    return await this.#service.deleteCourt(this.#message.data.courtId);

                case "getAllCourts":
                    return await this.#service.getAllCourts();

                case "getCourtByOwner":
                    if (!this.#message.data.owner_email) {
                        return { error: "Invalid request. Missing owner_email.", request: this.#message };
                    }
                    return await this.#service.getCourtByOwner(this.#message.data.owner_email);

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