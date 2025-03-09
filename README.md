index.js 是入口文件，启动 Express 服务器
routes 定义路由
config 配置数据库和服务器
controllers 包括JavaScript控制器架构
middleware 包含用于身份验证和验证的中间件文件


estima-backend/
│── node_modules/         # 依赖库
│── config/               # 配置文件
│   ├── db.js             # 数据库连接配置
│── controllers/          # 业务逻辑控制器
│   ├── userController.js # 用户相关控制器
│── models/               # 数据模型
│   ├── userModel.js      # 用户数据库操作
│── routes/               # 路由
│   ├── userRoutes.js     # 用户相关路由
│── middlewares/          # 中间件
│   ├── authMiddleware.js # 认证中间件（JWT）
│── utils/                # 工具函数
│   ├── responseHandler.js# 统一返回格式
│── .env                  # 环境变量配置（数据库、密钥等）
│── index.js              # 入口文件
│── package.json          # 依赖和脚本
│── README.md             # 说明文档