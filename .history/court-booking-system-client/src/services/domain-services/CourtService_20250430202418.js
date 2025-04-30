import hotPocketService from '../common-services/HotPocketService';

class CourtService {
    async addCourt(formData) {
        // Ensure the Image field is included in the FormData
        if (!formData.has("Image")) {
            throw new Error("Image is required and must be included in the form data.");
        }

        // Serialize FormData, converting files (like Image) to base64 strings
        const serializedData = {};
        const promises = [];

        formData.forEach((value, key) => {
            if (value instanceof File) {
                // Convert File to a base64 string
                const promise = new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        serializedData[key] = reader.result; // Base64 string
                        resolve();
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(value);
                });
                promises.push(promise);
            } else {
                serializedData[key] = value;
            }
        });

        // Wait for all file conversions to complete
        await Promise.all(promises);

        // Send the request to the backend
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'addCourt',
            data: serializedData, // Serialized FormData object
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