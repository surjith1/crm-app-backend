const { ObjectId } = require("mongodb");
// const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = "$crm@pp#";

const db = require("../shared/db.connect");
const sendEmail = require("../shared/sendMail");

const contactsService = {
  async insertRequest(req, res) {
    try {
      const data = await db.service_requests.insertOne(req.body);
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(`Error inserting service_requests ${err}`);
    }
  },

  async getRequests(req, res) {
    try {
      const data = await db.service_requests
        .find({})
        .project({ requirement: 1, description: 1, status: 1, contact: 1 })
        .toArray();
      res.send(data);
    } catch (err) {
      console.log(`Error gettings service_requests ${err}`);
      res.status(500).send("Error getting service_requests");
    }
  },

  async updateRequest(req, res) {
    try {
      const { value: updatedValue } =
        await db.service_requests.findOneAndUpdate(
          { _id: ObjectId(req.params.id) },
          { $set: { ...req.body } },
          { returnDocument: "after" }
        );
      console.log(updatedValue);
      if (updatedValue) return res.status(200).send("service_requests updated");
    } catch (err) {
      res.status(400).send("service_requests update failed");
    }
  },

  async deleteRequest(req, res) {
    try {
      await db.service_requests.deleteOne({ _id: ObjectId(req.params.id) });
      res.status(200).send("Service request deleted successfully");
    } catch (err) {
      console.log(`Deleting service_requests error ${err}`);
      res.status(400).send("Delete service_requests failed");
    }
  },
};

module.exports = contactsService;
