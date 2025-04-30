import hotPocketService from '../common-services/HotPocketService';

class CourtService {
    async addCourt(FormData) {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'addCourt',
            data: {FormData:{formtData}}
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