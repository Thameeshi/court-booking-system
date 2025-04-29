const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
import { Tables } from "../../Constants/Tables";

export class DonationService {
    #message = null;
    #dbPath = settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
    }


    async createDonationRequest(data) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;
    
        try {
            await this.#dbContext.open();
    
            const findUserQuery = `SELECT Id FROM ${Tables.USER} WHERE Email = ?`;
            const userResult = await this.#dbContext.runSelectQuery(findUserQuery, [data.foodReceiverEmail]);
    
            if (userResult.length === 0) {
                throw new Error("Food receiver with the provided email does not exist.");
            }
    
            const foodReceiverID = userResult[0].Id;
    
            const donationEntity = {
                name: data.name,
                description: data.description,
                amount: data.amount,
                foodReceiverID: foodReceiverID,
                nfTokenID: data.nfTokenID,
                nfTokenSellOffer: data.nfTokenSellOffer,
            };
    
            const rowId = await this.#dbContext.insertValue(Tables.DONATIONREQUEST, donationEntity);
            resObj.success = { message: "Created donation request successfully", rowId: rowId };
            return resObj;
        } catch (error) {
            console.log("Error in creating donation request: ", error);
            resObj.error = error.message;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getMyDonationRequests(foodReceiver_email) {
        let resObj = {};
        try {
            await this.#dbContext.open();
    
            let query = `SELECT dr.* FROM ${Tables.DONATIONREQUEST} dr 
                         JOIN ${Tables.USER} u ON dr.FoodReceiverID = u.Id 
                         WHERE u.Email = ?`;
    
            console.log("Email:", foodReceiver_email);
    
            let donationRequests = await this.#dbContext.runSelectQuery(query, [foodReceiver_email]);
            console.log("Donation Requests:", donationRequests);
    
            resObj.success = donationRequests.length > 0 ? donationRequests : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving donation requests: ", error);
            resObj.error = error.message;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getAllDonationRequests() {
        let resObj = {};
        try {
            await this.#dbContext.open();
    
            let query = `SELECT * FROM ${Tables.DONATIONREQUEST}`;
    
            console.log("Query:", query);
    
            let donationRequests = await this.#dbContext.runSelectQuery(query);
            console.log("All Donation Requests:", donationRequests);
    
            resObj.success = donationRequests.length > 0 ? donationRequests : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving all donation requests: ", error);
            resObj.error = error.message;
            return resObj;
        } finally {
            this.#dbContext.close();
        }
    }

    async getMyDonations(donor_email) {
        let resObj = {};
        try {
            await this.#dbContext.open();

            let query = `SELECT dr.* FROM ${Tables.DONATIONREQUEST} dr 
                     JOIN ${Tables.USER} u ON dr.DonorID = u.Id 
                     WHERE u.Email = ?`;

            let donations = await this.#dbContext.runSelectQuery(query, [donor_email]);
            resObj.success = donations.length > 0 ? donations : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving donations: ", error);
        } finally {
            this.#dbContext.close();
        }
    }

    async acceptDonationRequest(donor_email, donationRequestID) {
        let resObj = {};
        resObj.reqId = this.#message.reqId;

        try {
            await this.#dbContext.open();

            let donorQuery = `SELECT Id FROM ${Tables.USER} WHERE Email = ?`;
            let donor = await this.#dbContext.runSelectQuery(donorQuery, [donor_email]);

            if (!donor || donor.length === 0) {
                resObj.error = "Donor not found.";
                return resObj;
            }

            let updateQuery = `UPDATE ${Tables.DONATIONREQUEST} SET DonorID = ? WHERE Id = ?`;
            let updateResult = await this.#dbContext.runQuery(updateQuery, [donor[0].Id, donationRequestID]);

            resObj.success = updateResult.changes > 0 ? "Donation request accepted successfully." : "Failed to accept donation request.";
            return resObj;
        } catch (error) {
            console.log("Error in accepting donation request: ", error);
        } finally {
            this.#dbContext.close();
        }
    }

    async getAvailableDonationRequests() {
        let resObj = {};
        try {
            await this.#dbContext.open();

            let query = `SELECT * FROM ${Tables.DONATIONREQUEST} WHERE DonorID IS NULL`;
            let availableRequests = await this.#dbContext.runSelectQuery(query);

            resObj.success = availableRequests.length > 0 ? availableRequests : null;
            return resObj;
        } catch (error) {
            console.log("Error in retrieving available donation requests: ", error);
        } finally {
            this.#dbContext.close();
        }
    }
}