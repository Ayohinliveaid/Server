const propertyController = require('../controllers/propertyController');
const express = require('express');
const propertyRouter = express.Router();

propertyRouter.post('/getCats', propertyController.getCats);
propertyRouter.post('/getData', propertyController.getData);

module.exports = propertyRouter;
