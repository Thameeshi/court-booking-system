const { UserService } = require("./Services/Domain.Services/UserService");
const CourtService = require("./Services/Domain.Services/CourtService");

if (message.type === "User") {
	const userService = new UserService(message);
	switch (message.subType) {
		case "getAll": return await userService.getUserList();
		case "delete": return await userService.deleteUser(); // ← add this method if not yet
	}
}

if (message.type === "Court") {
	const courtService = new CourtService(message);
	switch (message.subType) {
		case "getAll": return await courtService.getAllCourts();
		case "delete": return await courtService.deleteCourt(message.data.id);
	}
}
