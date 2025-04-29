import hotPocketService from "../common-services/HotPocketService";



export const courtService = {
    // Add a new court
    addCourt: async (courtData) => {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'addCourt',
            data: courtData
        });
    },

    // Get courts by owner email
    getCourtByOwner: async (ownerEmail) => {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'getCourtByOwner',
            data: { email: ownerEmail }
        });
    },

    // Edit court details
    editCourt: async (courtId, updatedData) => {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'editCourt',
            data: { id: courtId, ...updatedData }
        });
    },

    // Delete a court by its ID
    deleteCourt: async (courtId) => {
        return await hotPocketService.getServerInputResponse({
            type: 'Court',
            subType: 'deleteCourt',
            data: { id: courtId }
        });
    }
};