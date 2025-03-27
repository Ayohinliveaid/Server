const userController = require("../controllers/userController");

const express = require("express");
const userRouter = express.Router();

userRouter.post("/login", userController.login);
userRouter.post("/signup", userController.signup);

module.exports = userRouter;
