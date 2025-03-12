const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes')



const express = require('express');
const app = express();
app.use(express.json());


// 用户相关路由
app.use('/user', userRoutes);
app.use('/property', propertyRoutes);
app.listen(8000);

console.log("服务器运行于 http://127.0.0.1:8000/");


