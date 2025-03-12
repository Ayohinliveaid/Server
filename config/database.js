const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '00000000',
    database: 'Estima',
})
connection.connect((err) => {
    if (err) {
        console.log('Estima数据库连接失败', err);
    } else {
        console.log('已连接到数据库Estima数据库，连接 ID：' + connection.threadId);
    }
});

module.exports = connection;