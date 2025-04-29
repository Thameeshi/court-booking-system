import { ServiceTypes } from "./Constants/ServiceTypes";
import { UserController } from "./Controllers/User.Controller";
import { DonationController } from "./Controllers/Donation.Controller";
const settings = require("./settings.json").settings;

export class Controller {
	dbPath = settings.dbPath;
	#userController = null;
	#donationController = null;

	async handleRequest(user, message, isReadOnly) {
		
		this.#userController = new UserController(message);
		this.#donationController = new DonationController(message);

		let result = {};

		if (message.type == ServiceTypes.User) {
			result = await this.#userController.handleRequest();
		} else if (message.type == ServiceTypes.DonationRequest) {
			result = await this.#donationController.handleRequest();
		} else
		{
			result = { success: "Invalid request type", message:message, messageType: message.type };
		}

		if (isReadOnly) {
			await this.sendOutput(user, result);
		} else {
			await this.sendOutput(
				user,
				message.promiseId ? { promiseId: message.promiseId, ...result } : result
			);
		}
	}

	sendOutput = async (user, response) => {
		console.log("Sending response to user: ", response);
		await user.send(response);
		console.log("Response sent to user");
	};
}
