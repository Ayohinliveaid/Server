const propertyController = require('../controllers/propertyController');
const express = require('express');
const propertyRouter = express.Router();

propertyRouter.post('/getProperty', propertyController.getProperty);

module.exports = propertyRouter;
