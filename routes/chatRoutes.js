const chatController = require("../controllers/chatController");
const express = require("express");
const chatRouter = express.Router();

chatRouter.post("/saveTheChat", chatController.saveTheChat);
chatRouter.post("/updateChatHistory", chatController.updateChatHistory);
chatRouter.post("/getChatHistroy", chatController.getChatHistroy);
chatRouter.post("/getSavedChats", chatController.getSavedChats);
chatRouter.post("/getResponse", chatController.getResponse);

module.exports = chatRouter;
