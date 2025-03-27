const AIController = require("../controllers/AIController");
const express = require("express");
const AIRouter = express.Router();

AIRouter.post("/requestConfig", AIController.requestConfig);

module.exports = AIRouter;
