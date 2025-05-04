import { CourtService } from "../Services/Domain.Services/CourtService";
import { BookingService } from "../Services/Domain.Services/BookingService";  // Make sure this import exists

export class CourtController {
    #message = null;
    #service = null;
    #bookingService = null;

    constructor(message) {
        this.#message = message;
        this.#service = new CourtService(message);
        this.#bookingService = new BookingService(message);  // Make sure BookingService is properly instantiated
        console.log("CourtController initialized with services");
    }

    async handleRequest() {
        try {
            console.log("Received message:", this.#message);
            console.log("CourtController handling request:", this.#message);
            console.log("Request subType:", this.#message.subType);

            console.log("Received subType:", this.#message.subType);
            console.log("Expected subType: getUserBookings");
            console.log("Comparison result:", this.#message.subType === "getUserBookings");

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

                case "getCourtByOwner":
                    if (!this.#message.data || !this.#message.data.email) {
                        return { error: "Missing owner email in request." };
                    }
                    return await this.#service.getCourtByOwner(this.#message.data.email);

                // Booking related cases
                case "createBooking":
                    console.log("Processing createBooking request");
                    if (!this.#message.data || !this.#message.data.UserEmail || !this.#message.data.CourtId || !this.#message.data.Date || !this.#message.data.StartTime || !this.#message.data.EndTime) {
                        return { error: "Missing required fields for booking." };
                    }
                    return await this.#bookingService.createBooking(this.#message.data);

                case "confirmBooking":
                    console.log("Processing confirmBooking request");
                    if (!this.#message.data || !this.#message.data.bookingId) {
                        return { error: "Missing bookingId in request." };
                    }
                    return await this.#bookingService.confirmBooking(this.#message.data.bookingId);

                case "getUserBookings":
                    if (!this.#message.data || !this.#message.data.UserEmail) {
                        return { error: "Missing UserEmail in request." };
                    }
                    return await this.#bookingService.getUserBookings(this.#message.data.UserEmail);

                default:
                    console.error("Invalid subType:", this.#message.subType);
                    return { error: `Invalid request subType: ${this.#message.subType}`, request: this.#message };
            }
        } catch (error) {
            console.error("Error in CourtController:", error);
            return { error: error.message || "An unexpected error occurred in CourtController.", request: this.#message };
        }
    }
}