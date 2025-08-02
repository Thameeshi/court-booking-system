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
