const propertyController = require('../controllers/propertyController');
const express = require('express');
const propertyRouter = express.Router();

propertyRouter.post('/getProperty', propertyController.getProperty);
propertyRouter.get('/getData', propertyController.getData);

module.exports = propertyRouter;
