const userModel = require("../models/userModel");

//登录方法，调用查找用户方法
const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await userModel.queryUserByPhoneNumber(phoneNumber);
    if (user.password !== password) {
      return res.status(401).json({ message: "密码错误" });
    } else {
      const user = { phoneNumber };
      const token = userModel.generateToken(user);
      // res.cookie("estimaToken", token, {
      //   httpOnly: false, // 允许 JavaScript 访问
      //   secure: false, // 开发环境设置 false，生产环境应为 true（HTTPS）
      //   sameSite: "none", // 允许跨站请求携带
      //   maxAge: 7200 * 1000, // 7200 秒
      // });
      console.log("token", token);
      return res.status(200).json({ message: "登录成功", token });
    }
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

//注册方法，调用查找用户和新增用户方法
const signup = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await userModel.queryUserByPhoneNumber(phoneNumber);
    //返回用户信息
    //http status code 409，和当前资源冲突
    res.status(409).json({ message: "该用户名已注册" });
  } catch (error) {
    if (error == "用户未注册") {
      await userModel.addUser(phoneNumber, password);
      try {
        res.status(200).json({ message: "注册成功" });
      } catch (err) {
        res.status(400).json({ error: err });
      }
    } else {
      res.status(400).json({ error: err });
    }
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { user } = req.body;
    const userInfo = await userModel.queryUserByPhoneNumber(user.phoneNumber);
    // console.log("getUserInfo's user", user);
    return res.status(200).json({ userInfo });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

module.exports = { login, signup, getUserInfo };
