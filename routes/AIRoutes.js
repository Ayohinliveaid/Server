const AIController = require("../controllers/AIController");
const authMiddleware = require("../middlewares/authMiddleware");
const express = require("express");
const AIRouter = express.Router();

AIRouter.post(
  "/requestConfig",
  authMiddleware.authenticateToken,
  AIController.requestConfig
);

module.exports = AIRouter;
