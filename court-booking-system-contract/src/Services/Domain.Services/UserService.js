const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
import { Tables } from "../../Constants/Tables";

export class UserService {
	#message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}

	async registerUser() {
		let resObj = {};
		resObj.reqId = this.#message.reqId;

		try {
			this.#dbContext.open();
			const data = this.#message.data;

			const userEntity = {
				xrplAddress: data.xrplAddress,
				email: data.email,
				name: data.name,
				userRole: data.userRole,
				description: data.description,
				lat: data.lat,
				lng: data.lng,
			};

			const rowId = await this.#dbContext.insertValue(Tables.USER, userEntity);
			resObj.success = { message:"Registered user successfully", rowId: rowId };
			return resObj;
		} catch (error) {
		} finally {
			this.#dbContext.close();
		}
	}

	async getUserList() {
		let resObj = {};
		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER`;

			let userRows = await this.#dbContext.runSelectQuery(query);

			console.log(userRows);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing users: ", error);
		} finally {
			this.#dbContext.close();
		}
	}

	async checkIfUserExists(){
		let resObj = {};
		const email = this.#message.data?.email;
		console.log("checkIfUserExists user email: ",email );

		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER WHERE Email = '${email}'`;

			let userRows = await this.#dbContext.runSelectQuery(query);
			console.log("userRows: ",userRows );
			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in checking user: ", error);
		} finally {
			this.#dbContext.close();
		}
	}

	async getFoodRecipientList(){
		let resObj = {};

		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER WHERE UserRole = 'FoodRecipient'`;

			let userRows = await this.#dbContext.runSelectQuery(query);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing food recipients: ", error);
		} finally {
			this.#dbContext.close();
		}
	}
}
