//处理对话的获取和保存
const connection = require('../config/database');
//保存对话
const saveChatToChatHistory = (chat) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(chat.data);
        const question = chat.question;
        const answer = chat.answer;
        const query = "insert into chatHistory (question, answer, data) VALUES (?, ?, ?);";
        connection.query(query, [question, answer, data], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve("保存成功");
            }
        })
    })
}
const saveChatToSavedChats = (chat) => {
    return new Promise((resolve, reject) => {
        const id = chat.id;
        const data = JSON.stringify(chat.data);
        const question = chat.question;
        const answer = chat.answer;
        const query = "insert into savedChats (id, question, answer, data) VALUES (?, ?, ?, ?);";
        connection.query(query, [id, question, answer, data], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve("保存成功");
            }
        })
    })
    //将chatHistory中对话的saved属性改为1，标记为已经保存
}



const updateSavedState = (chat) => {
    return new Promise((resolve, reject) => {
        connection.query('update chatHistory set saved = 1 where id = ?', [chat.id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve("1");
            }
        })
    })

}





//查找对话历史状态，如果历史记录满十条，返回最早一条的id，如果没有，返回0；
const getChatHistory = () => {
    return new Promise((reslove, reject) => {
        connection.query('select * from chatHistory', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                reslove(rows);
            }
        })

    })

}

const deleteChat = (id) => {

    return new Promise((reslove, reject) => {
        connection.query('delete from chatHistory where id = ?;', [id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                reslove("删除成功");
            }
        })

    })



}

module.exports = { saveChatToChatHistory, saveChatToSavedChats, getChatHistory, deleteChat, updateSavedState }