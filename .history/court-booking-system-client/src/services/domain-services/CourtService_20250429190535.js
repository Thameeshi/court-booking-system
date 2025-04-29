const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const { XRPLClient } = require('./xrpl/xrplClient');

class CourtService {
  constructor() {
    this.db = new sqlite3.Database('./database/courts.db', (err) => {
      if (err) return console.error('Database connection error:', err);
      console.log('CourtService DB connected.');
    });

    this.db.run(`
      CREATE TABLE IF NOT EXISTS courts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        location TEXT,
        type TEXT,
        price REAL,
        walletAddress TEXT,
        userName TEXT,
        image TEXT,
        uri TEXT,
        hash TEXT
      )
    `);
  }

  getAllCourts(callback) {
    this.db.all('SELECT * FROM courts', callback);
  }

  addCourt(data) {
    return hotPocketService.getServerInputResponse({
      type: 'Court',
      subType: 'addCourt',
      data
    });
  }

  async addCourtToDB(data) {
    const { name, description, location, type, price, walletAddress, userName } = data;

    const hash = crypto.randomBytes(16).toString('hex');
    const random = Math.floor(Math.random() * 1000);
    const uri = `https://picsum.photos/seed/${random}${hash}/200/200`;

    const xrplClient = new XRPLClient();
    const imageCid = await xrplClient.mintCourtNFT(walletAddress, name, uri, hash);

    return new Promise((resolve, reject) => {
      const stmt = `
        INSERT INTO courts 
        (name, description, location, type, price, walletAddress, userName, image, uri, hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(stmt, [name, description, location, type, price, walletAddress, userName, imageCid, uri, hash], function (err) {
        if (err) return reject(err);
        resolve({ courtId: this.lastID });
      });
    });
  }
}

module.exports = CourtService;