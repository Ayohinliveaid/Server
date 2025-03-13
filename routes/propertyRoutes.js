const propertyController = require('../controllers/propertyController');
const express = require('express');
const propertyRouter = express.Router();

propertyRouter.post('/getCats', propertyController.getCats);
propertyRouter.get('/getData', propertyController.getData);

module.exports = propertyRouter;
