const { ObjectId } = require("mongodb");
// const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const JWT_SECRET = "$crm@pp#";

const db = require("../shared/db.connect");
const sendEmail = require("../shared/sendMail");

const contactsService = {
  async insertContact(req, res) {
    //Check if contact already exists and insert contact
    const isContactExists = await db.contacts.findOne(
      { email: req.body.email },
      { phone: req.body.phone }
    );
    if (isContactExists) return res.status(400).send("Contact already exists");
    try {
      const data = await db.contacts.insertOne(req.body);
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(`Error inserting contacts ${err}`);
      console.log(`Error inserting contacts ${err}`);
    }
  },

  async getContacts(req, res) {
    try {
      const data = await db.contacts
        .find({}, { name: 1, email: 1, phone: 1 })
        .toArray();
      res.send(data);
    } catch (err) {
      console.log(`Error gettings contacts ${err}`);
      res.status(500).send("Error getting contacts");
    }
  },

  async updateContact(req, res) {
    try {
      const { value: updatedValue } = await db.contacts.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: { ...req.body } },
        { returnDocument: "after" }
      );
      console.log(updatedValue);
      if (updatedValue) return res.status(200).send("Contact updated");
    } catch (err) {
      res.status(400).send("Contact update failed");
    }
  },

  async deleteContact(req, res) {
    try {
      await db.contacts.deleteOne({ _id: ObjectId(req.params.id) });
      res.end();
    } catch (err) {
      console.log(`Deleting contact error ${err}`);
      res.status(400).send("Delete contact failed");
    }
  },

  async checkUserExists(req, res) {
    try {
      //Check user exists
      const user = await db.users.findOne({ email: req.body.email });
      if (!user) return res.status(400).send("User does not exists");
      return user;
    } catch (err) {
      console.log(`Unable to get user details ${err}`);
      res.status(500).send("Unable to get user details");
    }
  },
};

module.exports = contactsService;
