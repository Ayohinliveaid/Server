const userModel = require("../models/userModel");

//登录方法，调用查找用户方法
const login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const user = await userModel.queryUserByPhoneNumber(phoneNumber);
        if (user.password !== password) {
            return res.status(200).json({ message: '密码错误' });
        } else {
            return res.status(400).json({ message: '登录成功' });
        }
    } catch (err) {
        return res.status(400).json({ error: err });

    }
}


//注册方法，调用查找用户和新增用户方法
const signup = async (req, res) => {
    const { phoneNumber, password } = req.body;

    
    try {
        const user = await userModel.queryUserByPhoneNumber(phoneNumber);
        //返回用户信息
        res.status(200).json({ 'user id': user.id });
    } catch (err) {

        if (err == "用户未注册") {
            await userModel.addUser(phoneNumber,password);
            try {
                res.status(200).json({ "提示": "注册成功" });

            } catch (err) {
                res.status(400).json({ error: err })
            }

        } else {
            res.status(400).json({ error: err })
        }
    }
}

module.exports = { login ,signup}