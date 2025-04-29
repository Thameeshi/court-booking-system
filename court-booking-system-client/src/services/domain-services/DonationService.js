import hotPocketService from '../common-services/HotPocketService';

class DonationService {
    async createDonationRequest(donationData) {
        return await hotPocketService.getServerInputResponse({
            type: 'DonationRequest',
            subType: 'createDonationRequest',
            data: donationData
        });
    }

    async getMyDonationRequests(foodReceiverEmail) {
        return await hotPocketService.getServerReadReqResponse({
            type: 'DonationRequest',
            subType: 'getMyDonationRequests',
            data: { foodReceiver_email: foodReceiverEmail }
        });
    }

    async getAllDonationRequests() {
        return await hotPocketService.getServerReadReqResponse({
            type: 'DonationRequest',
            subType: 'getAllDonationRequests'
        });
    }

    async getMyDonations(donorEmail) {
        return await hotPocketService.getServerReadReqResponse({
            type: 'DonationRequest',
            subType: 'getMyDonations',
            data: { donor_email: donorEmail }
        });
    }

    async acceptDonationRequest(donorEmail, donationRequestID) {
        return await hotPocketService.getServerInputResponse({
            type: 'DonationRequest',
            subType: 'acceptDonationRequest',
            data: { donor_email: donorEmail, donationRequestID }
        });
    }

    async getAvailableDonationRequests() {
        return await hotPocketService.getServerReadReqResponse({
            type: 'DonationRequest',
            subType: 'getAvailableDonationRequests'
        });
    }
};

const donationServiceInstance = new DonationService();
export default donationServiceInstance;