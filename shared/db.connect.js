const { MongoClient, ConnectionCheckedInEvent } = require("mongodb");

const DB_URL =
  "mongodb+srv://mongo:mongo123@cluster0.at9xbmp.mongodb.net/crmapp";
const DB_NAME = "crmapp";

const client = new MongoClient(DB_URL);

module.exports = {
  //Db,collection connection names
  db: null,
  users: null,
  service_requests: null,
  leads: null,
  contacts: null,

  //Connecting to database
  async connect() {
    try {
      await client.connect();
      console.log(`Connected to db ${DB_URL}`);

      //Selecting the databse
      this.db = client.db(DB_NAME);
      console.log(`Selected database: ${DB_NAME}`);

      //Inititalizing collections
      this.users = this.db.collection("users");
      this.service_requests = this.db.collection("service_requests");
      this.leads = this.db.collection("leads");
      this.contacts = this.db.collection("contacts");

      console.log("Initialized collections");
    } catch (err) {
      console.log(`Could not connect to database ${err}`);
    }
  },
};
