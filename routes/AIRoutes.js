const AIController = require("../controllers/AIController");
const userMiddlewares = require("../middlewares/userMiddlewares");
const express = require("express");
const AIRouter = express.Router();

AIRouter.post(
  "/requestConfig",
  userMiddlewares.authenticateToken,
  AIController.requestConfig
);

module.exports = AIRouter;
