const connection = require('../config/database');

//查询用户，返回promise对象，返回用户信息
const queryUserByPhoneNumber = (phoneNumber) => {
    return new Promise((resolve, reject) => {
        connection.query('select * from users where phoneNumber=?', [phoneNumber], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    reject('用户未注册');
                } else {
                    resolve(rows[0]);
                }
            }
        })
    })
}
//用户注册
const addUser = (phoneNumber, password) => {
    return new Promise((resolve, reject) => {
        connection.query('insert into users (phoneNumber,password) values (?,?)', [phoneNumber, password], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve("新增成功");
            }
        })
    })

}

module.exports = { queryUserByPhoneNumber, addUser }
