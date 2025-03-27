const chatModel = require("../models/chatModel");
const AIModel = require("../models/AIModel");
const propertyModel = require("../models/propertyModel");

const saveTheChat = async (req, res) => {
  try {
    const { chat } = req.body;
    await chatModel.saveChatToSavedChats(chat);
    await chatModel.updateSavedState(chat);
    return res.status(200).json({ message: "保存成功" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

//更新历史记录，超出则删除，保持十条
const updateChatHistory = async (req, res) => {
  try {
    const rows = await chatModel.getChatHistory();
    if (rows.length >= 10) {
      await chatModel.deleteChat(rows[0].id);
    }
    const { chat } = req.body;
    await chatModel.saveChatToChatHistory(chat);
    return res.status(200).json({ message: "更新成功" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

const getChatHistroy = (req, res) => {
  chatModel
    .getChatHistory()
    .then((rows) => {
      return res.status(200).json({ chats: rows });
    })
    .catch((err) => {
      return res.status(400).json({ err: err.message });
    });
};

const getSavedChats = (req, res) => {
  chatModel
    .getSavedChats()
    .then((rows) => {
      return res.status(200).json({ chats: rows });
    })
    .catch((err) => {
      return res.status(400).json({ err: err.message });
    });
};

//接受前端提问，返回xy房产数据。
const getDataFromQuestion = async (req, res) => {
  try {
    //调用AIModel获取房产API的请求参数
    const { text } = req.body;
    const config = await AIModel.configFromDS(text);
    console.log(config);

    //构造房产API的路由并请求获得房产信息
    const data = await propertyModel.requestRealtorAPI(config);
    const properties = data.properties;
    console.log(properties);

    //调用PropertyModel对房产信息进行过滤
    const mappedData = propertyModel.mappedData(properties, "lat", "lon");
    console.log(mappedData);

    return res.status(200).json(mappedData);
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

module.exports = {
  saveTheChat,
  updateChatHistory,
  getChatHistroy,
  getSavedChats,
  getDataFromQuestion,
};
