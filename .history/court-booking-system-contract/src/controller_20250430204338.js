import { ServiceTypes } from "./Constants/ServiceTypes";
import { UserController } from "./Controllers/User.Controller";
import { CourtController } from "./Controllers/Court.Controller"; // Adjusted to match CourtController
const settings = require("./settings.json").settings;

export class Controller {
    dbPath = settings.dbPath;
    #userController = null;
    #courtController = null; // Replaced #donationController with #courtController

    async handleRequest(user, message, isReadOnly) {
        this.#userController = new UserController(message);
        this.#courtController = new CourtController(message); // Initialize the CourtController

        let result = {};

        // Check the message type to route to the appropriate controller
        if (message.type === ServiceTypes.User) {
            result = await this.#userController.handleRequest();
        } else if (message.type === ServiceTypes.Court) { // Corrected to match 'Court' type
            result = await this.#courtController.handleRequest(); // Court handling logic
        } else {
            result = { success: "Invalid request type", message: message, messageType: message.type };
        }

        // Send the response
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