const userRoutes =require('./routes/userRoutes');

const express = require('express');
const app = express();
app.use(express.json());


// 用户相关路由
app.use('/user', userRoutes);
app.listen(8000);

console.log("服务器运行于 http://127.0.0.1:8000/");

// // 注册
// app.post('/register', (req, res) => {
//     const { phoneNumber, password } = req.body;
//     connection.query('select * from users where phoneNumber=?', [phoneNumber], (err, rows) => {
//         if (err) {
//             res.send(err);
//         } else {
//             if (rows.length !== 0) {// 用户存在则提示
//                 res.send('用户已存在')
//             } else {//用户未存在则注册
//                 connection.query('insert into users (phoneNumber,password) values (?,?)', [phoneNumber, password], (err, rows) => {
//                     if (err) {
//                         res.send(err);
//                     } else {
//                         res.send(`注册成功，用户名：${phoneNumber}，密码：${password}`);
//                     }
//                 })
//             }
//         }
//     })



// })


const axios = require('axios');
app.get('/getCats', async (req, res) => {
    try {
        const response = await axios.get('https://api.thecatapi.com/v1/images/search?limit=3&mime_types=png', {
            headers: {
                'x-api-key': 'live_QTQoXsscFALX63br8NHnps2gMpgK0qiTiTNot1j6oVNcDDe2fdOzkZYfzcqDA8dK'
            }
        });

        // 格式化数据，只返回 `id` 和 `url`
        const cats = response.data.map(cat => ({
            id: cat.id,
            url: cat.url
        }));

        res.json({ message: '成功获取猫咪图片', data: cats });
    } catch (error) {
        console.error('获取猫咪数据失败:', error);
        res.status(500).json({ message: '获取数据失败' });
    }
});