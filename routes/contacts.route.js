const route = require("express").Router();

const service = require("../services/contacts.service");

route.get("/", service.getContacts);
route.post("/", service.insertContact);
route.put("/:id", service.updateContact);
route.delete("/:id", service.deleteContact);

module.exports = route;
