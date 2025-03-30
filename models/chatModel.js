//处理对话的获取和保存
const connection = require("../config/database");
//保存对话
const saveChatToChatHistory = (chat, user = { phoneNumber: 19106537806 }) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(chat.data);
    const question = chat.question;
    const answer = chat.answer;
    const phoneNumber = user.phoneNumber;
    const query =
      "insert into chatHistory (question, answer, data,phoneNumber) VALUES (?, ?, ?,?);";
    connection.query(
      query,
      [question, answer, data, phoneNumber],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve("保存成功");
        }
      }
    );
  });
};
const saveChatToSavedChats = (chat, user = { phoneNumber: 19106537806 }) => {
  return new Promise((resolve, reject) => {
    const id = chat.id;
    const data = JSON.stringify(chat.data);
    const question = chat.question;
    const answer = chat.answer;
    const phoneNumber = user.phoneNumber;
    const query =
      "insert into savedChats (id, question, answer, data, phoneNumber) VALUES (?, ?, ?, ?,?);";
    connection.query(
      query,
      [id, question, answer, data, phoneNumber],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve("保存成功");
        }
      }
    );
  });
  //将chatHistory中对话的saved属性改为1，标记为已经保存
};

const updateSavedState = (chat) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "update chatHistory set saved = 1 where id = ?",
      [chat.id],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve("1");
        }
      }
    );
  });
};

//查找对话历史状态
const getChatHistory = (user = { phoneNumber: 19106537806 }) => {
  return new Promise((reslove, reject) => {
    const phoneNumber = user.phoneNumber;
    connection.query(
      "select * from chatHistory where phoneNumber=?",
      [phoneNumber],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          reslove(rows);
        }
      }
    );
  });
};

//查找保存列表
const getSavedChats = (user = { phoneNumber: 19106537806 }) => {
  return new Promise((reslove, reject) => {
    const phoneNumber = user.phoneNumber;
    connection.query(
      "select * from savedChats where phoneNumber=?",
      [phoneNumber],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          reslove(rows);
        }
      }
    );
  });
};

const deleteChat = (id) => {
  return new Promise((reslove, reject) => {
    connection.query(
      "delete from chatHistory where id = ?;",
      [id],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          reslove("删除成功");
        }
      }
    );
  });
};

module.exports = {
  saveChatToChatHistory,
  saveChatToSavedChats,
  getChatHistory,
  getSavedChats,
  deleteChat,
  updateSavedState,
};
