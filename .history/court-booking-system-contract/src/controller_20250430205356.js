import { ServiceTypes } from "./Constants/ServiceTypes";
import { UserController } from "./Controllers/User.Controller";
import { CourtController } from "./Controllers/Court.Controller";
const settings = require("./settings.json").settings;

export class Controller {
    dbPath = settings.dbPath;
    #userController = null;
    #courtController = null;

    async handleRequest(user, message, isReadOnly) {
        this.#userController = new UserController(message);
        this.#courtController = new CourtController(message);

        let result = {};

        // Route the request based on the message type
        if (message.type === ServiceTypes.User) {
            result = await this.handleUserRequest();
        } else if (message.type === ServiceTypes.Court) {
            result = await this.handleCourtRequest();
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

    // Handle User-related requests
    async handleUserRequest() {
        return await this.#userController.handleRequest();
    }

    // Handle Court-related requests
    async handleCourtRequest() {
        return await this.#courtController.handleRequest();
    }

    // Send the response to the user
    sendOutput = async (user, response) => {
        console.log("Sending response to user: ", response);
        await user.send(response);
        console.log("Response sent to user");
    };
}