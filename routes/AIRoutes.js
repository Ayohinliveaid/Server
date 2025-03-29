const AIController = require("../controllers/AIController");
const userMiddlewares = require("../middlewares/userMiddlewares");
const express = require("express");
const AIRouter = express.Router();

AIRouter.post(
  "/requestConfig",
  // userMiddlewares.authenticateToken,
  AIController.requestConfig
);

AIRouter.post(
  "/requestDescription",
  // userMiddlewares.authenticateToken,
  AIController.requestDescription

);


module.exports = AIRouter;
