const route = require("express").Router();

const service = require("../services/leads.service");

route.get("/", service.getLeads);
route.post("/", service.insertLead);
route.put("/:id", service.updateLead);
route.delete("/:id", service.deleteLead);

module.exports = route;
