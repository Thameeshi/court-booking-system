import { DonationService } from "../Services/Domain.Services/DonationService";

export class DonationController {
    #message = null;
    #service = null;

    constructor(message) {
        this.#message = message;
        this.#service = new DonationService(message);
    }

    async handleRequest() {
        try {
            switch (this.#message.subType) {
                case "createDonationRequest":
                    return await this.#service.createDonationRequest(this.#message.data);
                case "getMyDonationRequests":
                    return await this.#service.getMyDonationRequests(this.#message.data.foodReceiver_email);
                case "getAllDonationRequests":
                    return await this.#service.getAllDonationRequests();
                case "getMyDonations":
                    return await this.#service.getMyDonations(this.#message.data.donor_email);
                case "acceptDonationRequest":
                    return await this.#service.acceptDonationRequest(this.#message.data.donor_email, this.#message.data.donationRequestID);
                case "getAvailableDonationRequests":
                    return await this.#service.getAvailableDonationRequests();
                default:
                    return { error: "Invalid request subType.", request: this.#message };
            }
        } catch (error) {
            return { error: error };
        }
    }
}