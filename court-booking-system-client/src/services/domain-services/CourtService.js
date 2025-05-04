import hotPocketService from '../common-services/HotPocketService';

class CourtService {
    async addCourt(formData) {
        // Ensure the Image field is included in the FormData
        if (!formData.has("Image")) {
            throw new Error("Image is required and must be included in the form data.");
        }

        // Convert FormData to a plain object
        const data = Object.fromEntries(formData.entries());

        // Send the request to the backend
        return await hotPocketService.getServerInputResponse({
            type: "Court",
            subType: "addCourt",
            data: data, // Flattened FormData object
        });
    }

    async editCourt(courtId, updatedCourtData) {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'editCourt',
            data: {
                courtId,
                updatedData: updatedCourtData
            }
        });
    }

    async deleteCourt(courtId) {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'deleteCourt',
            data: { courtId }
        });
    }

    async getAllCourts() {
        return await hotPocketService.getServerReadReqResponse({
            type: 'Court',
            subType: 'getAllCourts'
        });
    }

    async getCourtByOwner(ownerEmail) {
        return await hotPocketService.getServerReadReqResponse({
            type: 'Court',
            subType: 'getCourtByOwner',
            data: { email: ownerEmail }
        });
    }

    async getMyCourts(email) {
        // Alias for getCourtByOwner to match usage in CreateCourt.js
        return await this.getCourtByOwner(email);
    }

    // Booking methods
    async createBooking(bookingData) {
        // Validate booking data
        if (!bookingData.UserEmail || !bookingData.CourtId || !bookingData.Date || !bookingData.StartTime || !bookingData.EndTime) {
            throw new Error("Missing required fields: UserEmail, CourtId, Date, StartTime, or EndTime.");
        }

        console.log("Sending booking data to backend:", bookingData);

        // Send the booking request to the backend
        return await hotPocketService.getServerInputResponse({
            type: "Court",
            subType: "createBooking",
            data: bookingData,
        });
    }

    async confirmBooking(bookingId) {
        // Validate booking ID
        if (!bookingId) {
            throw new Error("Booking ID is required to confirm a booking.");
        }

        // Send the confirm booking request to the backend
        return await hotPocketService.getServerInputResponse({
            type: "Court",
            subType: "confirmBooking",
            data: { bookingId },
        });
    }

    async getUserBookings(userEmail) {
        if (!userEmail) {
            throw new Error("UserEmail is required to fetch bookings.");
        }

        console.log("Fetching bookings for user:", userEmail);

        // Send the request to the backend
        try {
            const response = await hotPocketService.getServerReadReqResponse({
                type: "Court",
                subType: "getUserBookings",
                data: { UserEmail: userEmail },
            });
            
            console.log("Response from backend:", response);
            return response;
        } catch (error) {
            console.error("Error fetching user bookings:", error);
            throw error;
        }
    }
}

const courtServiceInstance = new CourtService();
export default courtServiceInstance;