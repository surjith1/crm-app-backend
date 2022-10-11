const route = require("express").Router();

const service = require("../services/users.service");

route.get("/", service.getUsers);
route.get("/verify", service.verifyUser);
route.post("/", service.insertUser);
route.post("/login", service.loginUser);
route.post("/forgot-password", service.forgotPassword);
route.post("/reset-password/:id", service.resetPassword);
route.put("/:id", service.updateUser);
route.delete("/:id", service.deleteUser);

module.exports = route;
