const predictionController = require("../controllers/predictionController");
const express = require("express");
const predictionRouter = express.Router();
const userMiddlewares = require("../middlewares/userMiddlewares");

predictionRouter.post(
  "/linearRegressionPredict",
  userMiddlewares.authenticateToken,
  predictionController.linearRegressionPredict
);
predictionRouter.post(
  "/polynomialRegressionPredict",
  userMiddlewares.authenticateToken,
  predictionController.polynomialRegressionPredict
);
predictionRouter.post(
  "/optimizedPolynomialRegressionPredict",
  // userMiddlewares.authenticateToken,
  predictionController.optimizedPolynomialRegressionPredict
);

predictionRouter.post(
  "/testEvaluationModel",
  // userMiddlewares.authenticateToken,
  predictionController.testEvaluationModel
);

predictionRouter.post(
  "/ARIMAPredict",
  // userMiddlewares.authenticateToken,
  predictionController.ARIMAPredict
);

predictionRouter.post(
  "/optimizedARIMAPredict",
  // userMiddlewares.authenticateToken,
  predictionController.optimizedARIMAPredict
);

predictionRouter.post(
  "/BPNetworkPredict",
  // userMiddlewares.authenticateToken,
  predictionController.BPNetworkPredict
);

predictionRouter.post(
  "/SVMRegressionPredict",
  // userMiddlewares.authenticateToken,
  predictionController.SVMRegressionPredict
);
predictionRouter.post(
  "/optimizedSVMRegressionPredict",
  // userMiddlewares.authenticateToken,
  predictionController.optimizedSVMRegressionPredict
);

predictionRouter.post(
  "/optimizedPredict",
  // userMiddlewares.authenticateToken,
  predictionController.optimizedPredict
);

// predictionRouter.post('/updatepredictionHistory', predictionController.updatepredictionHistory);
// predictionRouter.post('/getpredictionHistroy', predictionController.getpredictionHistroy);
// predictionRouter.post('/getSavedpredictions', predictionController.getSavedpredictions);

module.exports = predictionRouter;
