const chatController = require('../controllers/chatController')
const express = require('express');
const chatRouter = express.Router();

chatRouter.post('/saveTheChat', chatController.saveTheChat);
chatRouter.post('/updateChatHistory', chatController.updateChatHistory);
chatRouter.post('/getChatHistroy', chatController.getChatHistroy);





module.exports = chatRouter;