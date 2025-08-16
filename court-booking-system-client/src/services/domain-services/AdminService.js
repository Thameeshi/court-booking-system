<<<<<<< HEAD
import hotPocketService from "../common-services/HotPocketService";

class AdminService {
	// User management
	async getAllUsers() {
		return await hotPocketService.sendMessage({ type: "User", subType: "getAll" });
	}

	async deleteUser(userId) {
		return await hotPocketService.sendMessage({
			type: "User",
			subType: "delete",
			data: { id: userId },
		});
	}

	// Court management
	async getAllCourts() {
		return await hotPocketService.sendMessage({ type: "Court", subType: "getAll" });
	}

	async deleteCourt(courtId) {
		return await hotPocketService.sendMessage({
			type: "Court",
			subType: "delete",
			data: { id: courtId },
		});
	}
}

export default new AdminService();
=======
import hotPocketService from '../common-services/HotPocketService';

class AdminService {
  // Remove user by email or ID
  async removeUser(userIdentifier) {
    if (!userIdentifier) throw new Error("User identifier (ID or Email) is required.");
    
    return await hotPocketService.getServerInputResponse({
      type: 'Admin',
      subType: 'removeUser',
      data: { userIdentifier }
    });
  }

  // Remove court by court ID
  async removeCourt(courtId) {
    if (!courtId) throw new Error("Court ID is required.");
    
    return await hotPocketService.getServerInputResponse({
      type: 'Admin',
      subType: 'removeCourt',
      data: { courtId }
    });
  }

  // Remove pending court by ID
  async removePendingCourt(pendingCourtId) {
    if (!pendingCourtId) throw new Error("Pending court ID is required.");
    
    return await hotPocketService.getServerInputResponse({
      type: 'Admin',
      subType: 'removePendingCourt',
      data: { pendingCourtId }
    });
  }

  // Get all users
  async getAllUsers() {
    return await hotPocketService.getServerReadReqResponse({
      type: 'Admin',
      subType: 'getAllUsers'
    });
  }

  // Get all courts
  async getAllCourts() {
    return await hotPocketService.getServerReadReqResponse({
      type: 'Admin',
      subType: 'getAllCourts'
    });
  }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;
>>>>>>> 91a0210349f5a2babe5f60893d86b3b4d4768142
