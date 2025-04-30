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
            switch (this.#message.subType) {
                case "addCourt":
                    return await this.#service.addCourt(this.#message.data);
                case "editCourt":
                    return await this.#service.editCourt(this.#message.data.courtId, this.#message.data);
                case "deleteCourt":
                    return await this.#service.deleteCourt(this.#message.data.courtId);
                case "getAllCourts":
                    return await this.#service.getAllCourts();
                case "getCourtByOwner":
                    return await this.#service.getCourtByOwner(this.#message.data.owner_email);
                default:
                    return { error: "Invalid request subType.", request: this.#message };
            }
        } catch (error) {
            return { error: error };
        }
    }
}