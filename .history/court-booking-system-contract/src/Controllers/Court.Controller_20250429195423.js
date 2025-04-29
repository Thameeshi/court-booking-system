import { CourtService } from "../services/CourtService.js";

export class CourtController {
    #message;
    #service;

    constructor(message) {
        this.#message = message;
        this.#service = new CourtService();
    }

    async handleRequest() {
        switch (this.#message.subType) {
            case "addCourt":
                return await this.#service.addCourt(this.#message.data);
            case "getCourtByOwner":
                return await this.#service.getCourtByOwner(this.#message.data.email);
            case "editCourt":
                return await this.#service.editCourt(this.#message.data.id, this.#message.data);
            case "deleteCourt":
                return await this.#service.deleteCourt(this.#message.data.id);
            case "getAllCourts":
                return await this.#service.getAllCourts();
            default:
                return { status: "error", message: "Invalid subtype for CourtController" };
        }
    }
}