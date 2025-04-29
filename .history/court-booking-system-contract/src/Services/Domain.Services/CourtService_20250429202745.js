// backend/services/domain-services/CourtService.js

const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../common-services/dbHandler").default;
const { Tables } = require("../../Constants/Tables");

class CourtService {
    #message = null;
    #dbPath = settings.dbPath;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
    }

    async createCourt(data) {
        const resObj = { reqId: this.#message.reqId };
        try {
            await this.#dbContext.open();

            const courtEntity = {
                Name: data.name,
                Description: data.description,
                Price: data.price,
                OwnerEmail: data.ownerEmail,
                NFTokenID: data.nfTokenID,
                NFTokenSellOffer: data.nfTokenSellOffer,
                BookingID: null,
            };

            const rowId = await this.#dbContext.insertValue(Tables.COURT, courtEntity);
            resObj.success = { message: "Court added successfully", rowId };
        } catch (err) {
            console.error("Court creation error:", err);
            resObj.error = err.message;
        } finally {
            this.#dbContext.close();
        }
        return resObj;
    }

    async getMyCourts(ownerEmail) {
        const resObj = {};
        try {
            await this.#dbContext.open();

            const query = `SELECT * FROM ${Tables.COURT} WHERE OwnerEmail = ?`;
            const courts = await this.#dbContext.runSelectQuery(query, [ownerEmail]);

            resObj.success = courts;
        } catch (err) {
            console.error("Get courts error:", err);
            resObj.error = err.message;
        } finally {
            this.#dbContext.close();
        }
        return resObj;
    }
}

module.exports = CourtService;
