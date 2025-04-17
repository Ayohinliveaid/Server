const userController = require("../controllers/userController");
const express = require("express");
const userRouter = express.Router();
const userMiddlewares = require("../middlewares/userMiddlewares");

userRouter.post("/login", userController.login);
userRouter.post("/signup", userController.signup);
userRouter.post(
  "/getUserInfo",
  userMiddlewares.authenticateToken,
  userController.getUserInfo
);

module.exports = userRouter;
