const jwt = require("jsonwebtoken");
const SECRET_KEY = "your-secret-key"; // 生产环境请使用环境变量

// 认证中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // 从请求头获取 token，适用于token没有配置httponly，js前端手动发送的情况
  // const token = req.cookies?.estimaToken;
  if (!token) {
    return res.status(401).json({ message: "未提供 Token" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "无效的 Token" });
    }
    req.body.user = user; // 解析出的用户信息存入 req.user，供后续路由使用
    // console.log("middlewareUser", user);
    next(); // 继续执行下一个中间件或路由
  });
};

module.exports = { authenticateToken };
