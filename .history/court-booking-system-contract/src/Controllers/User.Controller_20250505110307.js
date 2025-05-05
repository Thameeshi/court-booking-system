import { UserService } from "../Services/Domain.Services/UserService";

export class UserController {
	#message = null;
	#service = null;

	constructor(message) {
		this.#message = message;
		this.#service = new UserService(message);
	}

	async handleRequest() {
		try {
			let result;
			switch (this.#message.subType) {
				case "checkIfUserExists":
					result = await this.#service.checkIfUserExists();
					break;
				case "getUserList":
					result = await this.#service.getUserList();
					break;
				case "registerUser":
					result = await this.#service.registerUser();
					break;
				case "getFoodRecipientList":
					result = await this.#service.getFoodRecipientList();
					break;
				default:
					return { error: "Invalid request subType.", request: this.#message };
			}
			// Return response based on result from service
			if (result.error) {
				return { error: result.error, request: this.#message };
			}
			return result;
		} catch (error) {
			return { error: error.message || "Unknown error occurred", request: this.#message };
		}
	}
}