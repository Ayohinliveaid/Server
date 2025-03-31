const chatController = require("../controllers/chatController");
const express = require("express");
const chatRouter = express.Router();
const userMiddlewares = require("../middlewares/userMiddlewares");

chatRouter.post(
  "/saveTheChat",
  userMiddlewares.authenticateToken,
  chatController.saveTheChat
);

chatRouter.post(
  "/deleteTheChat",
  userMiddlewares.authenticateToken,
  chatController.deleteTheChat
);
chatRouter.post(
  "/updateChatHistory",
  userMiddlewares.authenticateToken,
  chatController.updateChatHistory
);
chatRouter.post(
  "/getChatHistroy",
  userMiddlewares.authenticateToken,
  chatController.getChatHistroy
);
chatRouter.post(
  "/getSavedChats",
  userMiddlewares.authenticateToken,
  chatController.getSavedChats
);
chatRouter.post(
  "/getResponse",
  userMiddlewares.authenticateToken,
  chatController.getResponse
);

module.exports = chatRouter;
