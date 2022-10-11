const { ObjectId } = require("mongodb");
// const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../shared/db.connect");
const sendEmail = require("../shared/sendMail");

const contactsService = {
  async insertLead(req, res) {
    try {
      const data = await db.leads.insertOne(req.body);
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(`Error inserting lead ${err}`);
      console.log(`Error inserting lead ${err}`);
    }
  },

  async getLeads(req, res) {
    try {
      const data = await db.leads
        .find({}, { requirement: 1, description: 1, status: 1, contact: 1 })
        .toArray();
      res.send(data);
    } catch (err) {
      console.log(`Error gettings leads ${err}`);
      res.status(500).send("Error getting leads");
    }
  },

  async updateLead(req, res) {
    try {
      const { value: updatedValue } = await db.leads.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: { ...req.body } },
        { returnDocument: "after" }
      );
      console.log(updatedValue);
      if (updatedValue) return res.status(200).send("Lead updated");
    } catch (err) {
      res.status(400).send("Lead update failed");
    }
  },

  async deleteLead(req, res) {
    try {
      await db.leads.deleteOne({ _id: ObjectId(req.params.id) });
      res.end();
    } catch (err) {
      console.log(`Deleting lead error ${err}`);
      res.status(400).send("Delete lead failed");
    }
  },
};

module.exports = contactsService;
