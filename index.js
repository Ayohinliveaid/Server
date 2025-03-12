
const connection = require('./config/database.js');



const express = require('express');
const app = express();
app.use(express.json());

// 登录
app.post('/login', (req, res) => {
    const { phoneNumber, password } = req.body;
    connection.query('select password from users where phoneNumber=?', [phoneNumber], (err, rows) => {
        if (err) {
            console.log('登录失败', err);
        } else {
            if (rows.length === 0) {
                res.send({ message: '用户不存在，请注册', data: rows });
            } else if (rows[0].password === password) {
                res.send('登录成功');
            } else {
                console.log(rows[0].password, password);
                res.send('密码错误');
            }
        }
    })
    // connection.query('select * from users', (err, rows) => {
    //     if (err) {
    //         console.log('登录失败', err);
    //     } else {
    //         res.send({ message: '用户列表', data: rows });
    //     }
    // })
})
app.listen(8000);

console.log("服务器运行于 http://127.0.0.1:8000/");

// connection.end((err) => {
//     if (err) {
//         console.log('断开连接失败', err);
//     } else {
//         console.log('连接已断开');
//     }
// });


// 注册
app.post('/register', (req, res) => {
    const { phoneNumber, password } = req.body;
    connection.query('select * from users where phoneNumber=?', [phoneNumber], (err, rows) => {
        if (err) {
            res.send(err);
        } else {
            if (rows.length !== 0) {// 用户存在则提示
                res.send('用户已存在')
            } else {//用户未存在则注册
                connection.query('insert into users (phoneNumber,password) values (?,?)', [phoneNumber, password], (err, rows) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(`注册成功，用户名：${phoneNumber}，密码：${password}`);
                    }
                })
            }
        }
    })



})