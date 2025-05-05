import hotPocketService from '../common-services/HotPocketService';

class UserService {
    async checkUser(email) {
        return await hotPocketService.getServerReadReqResponse({
            type: 'User',
            subType: 'checkIfUserExists',
            data: { email }
        });
    }

    async getFoodRecipientList() {
        return await hotPocketService.getServerReadReqResponse({
            type: 'User',
            subType: 'getFoodRecipientList'
        });
    }

    async getUserList() {
        return await hotPocketService.getServerReadReqResponse({
            type: 'User',
            subType: 'getUserList'
        });
    }

    async registerUser(userData) {
        return await hotPocketService.getServerInputResponse({
            type: 'User',
            subType: 'registerUser',
            data: userData
        });
    }
};

const userServiceInstance = new UserService();
export default userServiceInstance;