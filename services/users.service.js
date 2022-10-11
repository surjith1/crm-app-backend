const { ObjectId } = require("mongodb");
//const bcrypt= require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = "$crm@pp#";

const db = require("../shared/db.connect");
const sendEmail = require("../shared/sendMail");
const { send } = require("process");

const service = {
  async insertUser(req, res) {
    //Check if usre already exists and insert user
    const isUserExists = await db.users.findOne({ email: req.body.email });
    if (isUserExists) return res.status(400).send("User already exists");
    //Encrypt password
    req.body.password = await service.encryptPassword(req.body.password);
    try {
      const data = await db.users.insertOne(req.body);
      const verifyToken = crypto.randomBytes(18).toString("hex");
      await db.users.findOneAndUpdate(
        { email: req.body.email },
        { $set: { verifyToken } }
      );
      const link = `http://localhost:3001/users/verify?token=${verifyToken}`;
      await sendEmail(
        req.body.email,
        "Verify email",
        "",
        `<p>Click on the below link to verify your email</p> <br> <a href=${link}>${link}</a>`
      );
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(`Error inserting users ${err}`);
    }
  },

  async getUsers(req, res) {
    try {
      const data = await db.users
        .find({})
        .project({ name: 1, email: 1, userType: 1 })
        .toArray();
      res.status(200).send(data);
    } catch (err) {
      res.status(500).send("Error getting users");
    }
  },

  async updateUser(req, res) {
    try {
      const { value: updatedValue } = await db.users.findOneAndUpdate(
        { _id: ObjectId(req.params.id) },
        { $set: { ...req.body } },
        { returnDocument: "after" }
      );
      console.log(updatedValue);
      if (updatedValue) return res.status(200).send("User updated");
    } catch (err) {
      res.status(400).send("User update failed");
    }
  },

  async deleteUser(req, res) {
    try {
      await db.users.deleteOne({ _id: ObjectId(req.params.id) });
      res.end();
    } catch (err) {
      res.status(400).send("Delete user failed");
    }
  },

  async checkUserExists(req, res) {
    try {
      //Check user exists
      const user = await db.users.findOne({ email: req.body.email });
      if (!user) return res.status(400).send("User does not exists");
      return user;
    } catch (err) {
      res.status(500).send("Unable to get user details");
    }
  },

  async encryptPassword(password) {
    //Encrypt password
    // const salt= await bcrypt.genSalt();
    // return await bcrypt.hash(password,salt);
    return password;
  },

  async loginUser(req, res) {
    try {
      //Check user exists
      const user = await service.checkUserExists(req, res);
      //Check user verified
      console.log(user.email);
      const { verified } = await db.users.findOne(
        { email: user.email },
        { verified: 1 }
      );
      console.log(verified);
      if (!verified) return res.status(401).send("Verify your email to login");
      //Check password
      // const isCorrect= await bcrypt.compare(req.body.password,user.password);
      let isCorrect = false;
      if (req.body.password === user.password) isCorrect = true;
      if (!isCorrect)
        return res.status(403).send("Username or password incorrect");
      //If correct generate auth token
      const authToken = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      res.status(200).send(authToken);
    } catch (err) {
      //res.status(500).send("Error logging you in");
    }
  },

  async forgotPassword(req, res) {
    try {
      const user = await service.checkUserExists(req, res);
      const resetToken = crypto.randomBytes(18).toString("hex");
      console.log(resetToken);
      await db.users.findOneAndUpdate(
        { email: user.email },
        { $set: { resetToken } }
      );
      const link = `http://localhost:3001/users/reset-password/${resetToken}`;
      await sendEmail(
        user.email,
        "Forgot password",
        "",
        `<p>Click on the below link to reset your password</p> <br> <a href=${link}>${link}</a>`
      );
      res
        .status(200)
        .send(
          `Check your email (${user.email}) ${link} for password reset link`
        );
    } catch (err) {
      res.status(500).send("Unable to reset your password");
    }
  },

  async resetPassword(req, res) {
    try {
      const user = await db.users.findOne({
        email: req.body.email,
        resetToken: req.params.id,
      });
      if (user.resetToken === req.params.id) {
        try {
          db.users.findOneAndUpdate(
            { email: req.body.email },
            { $unset: { resetToken: 1 } }
          );
          const passwordEncrypt = await service.encryptPassword(
            req.body.password
          );
          db.users.findOneAndUpdate(
            { email: req.body.email },
            { $set: { password: passwordEncrypt } }
          );
          res.status(200).send("Password changed successfully");
        } catch (err) {
          res.status(500).send("Unable to reset your password");
        }
      }
    } catch (err) {
      console.log(`Link not valid ${err}`);
      res.status(500).send("Link not valid");
    }
  },

  async verifyUser(req, res) {
    try {
      const verify = await db.users.findOne({ verifyToken: req.query.token });
      if (verify.verifyToken == req.query.token) {
        const user = await db.users.findOneAndUpdate(
          { verifyToken: req.query.token },
          { $unset: { verifyToken: 1 } }
        );
        db.users.findOneAndUpdate(
          { email: user.value.email },
          { $set: { verified: true } }
        );
        res.status(200).send("Email verified successfully");
      }
    } catch (err) {
      res
        .status(400)
        .send("Email cannot be verified or link has expired. Try again later");
    }
  },
};

module.exports = service;
