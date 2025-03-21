const predictionController = require("../controllers/predictionController");
const express = require("express");
const predictionRouter = express.Router();

predictionRouter.post(
  "/linearRegressionPredict",
  predictionController.linearRegressionPredict
);
predictionRouter.post(
  "/polynomialRegressionPredict",
  predictionController.polynomialRegressionPredict
);
// predictionRouter.post('/updatepredictionHistory', predictionController.updatepredictionHistory);
// predictionRouter.post('/getpredictionHistroy', predictionController.getpredictionHistroy);
// predictionRouter.post('/getSavedpredictions', predictionController.getSavedpredictions);

module.exports = predictionRouter;
