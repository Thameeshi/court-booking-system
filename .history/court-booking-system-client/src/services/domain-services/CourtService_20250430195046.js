import hotPocketService from '../common-services/HotPocketService';

class CourtService {
    async addCourt(formData) {
        // Ensure the Image field is included in the FormData
        if (!formData.has("Image")) {
            throw new Error("Image is required and must be included in the form data.");
        }

        // Convert FormData to a plain object while keeping the Image as a file
        const data = Object.fromEntries(formData.entries());

        // Send the request to the backend
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'addCourt',
            data: data, // Flattened FormData object
        });
    }

    async editCourt(courtId, updatedCourtData) {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'editCourt',
            data: { courtId, ...updatedCourtData }
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
            data: { owner_email: ownerEmail }
        });
    }

    async getMyCourts(email) {
        // Alias for getCourtByOwner to match usage in CreateCourt.js
        return await this.getCourtByOwner(email);
    }
}

const courtServiceInstance = new CourtService();
export default courtServiceInstance;