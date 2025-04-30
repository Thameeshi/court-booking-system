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
			switch (this.#message.subType) {
				case "checkIfUserExists":
					return await this.#service.checkIfUserExists();
				case "getUserList":
					return await this.#service.getUserList();
				case "registerUser":
					return await this.#service.registerUser();
				case "getFoodRecipientList":
					return await this.#service.getFoodRecipientList();
				default:
					return { error: "Invalid request subType.", request: this.#message };
			}
		} catch (error) {
			return { error: error };
		}
	}
}