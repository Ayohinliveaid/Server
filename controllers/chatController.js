const chatModel = require("../models/chatModel");
const AIModel = require("../models/AIModel");
const propertyModel = require("../models/propertyModel");

const saveTheChat = async (req, res) => {
  try {
    const { chat, user } = req.body;
    await chatModel.saveChatToSavedChats(chat, user);
    const state = 1;
    await chatModel.updateSavedState(chat, state);
    return res.status(200).json({ message: "保存成功" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

const deleteTheChat = async (req, res) => {
  try {
    const { chat, user } = req.body;
    await chatModel.deleteChatFromSavedChats(chat);
    const state = 0;
    await chatModel.updateSavedState(chat, state);
    return res.status(200).json({ message: "删除成功" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

//更新历史记录，超出则删除，保持十条
const updateChatHistory = async (req, res) => {
  try {
    const { chat, user } = req.body;
    const rows = await chatModel.getChatHistory(user);
    if (rows.length >= 10) {
      await chatModel.deleteChatFromChatHistory(rows[0]);
    }
    await chatModel.saveChatToChatHistory(chat, user);
    return res.status(200).json({ message: "更新成功" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

const getChatHistroy = (req, res) => {
  const { user } = req.body;
  chatModel
    .getChatHistory(user)
    .then((rows) => {
      return res.status(200).json({ chats: rows });
    })
    .catch((err) => {
      return res.status(400).json({ err: err.message });
    });
};

const getSavedChats = (req, res) => {
  const { user } = req.body;
  chatModel
    .getSavedChats(user)
    .then((rows) => {
      return res.status(200).json({ chats: rows });
    })
    .catch((err) => {
      return res.status(400).json({ err: err.message });
    });
};

//接受前端自然语言提问，返回xy房产数据，可直接作为前端chartG2数据源展示

const getResponse = async (req, res) => {
  try {
    //调用AIModel获取房产API的请求参数

    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    let response = null;
    res.write(JSON.stringify({ step: 0, answer: "正在分析问题" }) + "\n");
    const { question } = req.body;
    let config = null;
    response = await AIModel.configFromDS(question);
    if (!response.stateCode || response.stateCode != 1) {
      res.end(
        JSON.stringify({
          step: 1,
          answer: response.answer,
        }) + "\n"
      );
      return;
    } else {
      config = response.answer;
      res.write(
        JSON.stringify({
          step: 1,
          answer: "问题已分析完成，正在检索房产数据",
          config,
        }) + "\n"
      );
    }

    // //构造房产API的路由并请求获得房产信息
    // const data = await propertyModel.requestRealtorAPI(config);
    const data = await propertyModel.requestLocalJSON(config); //节约API，暂时使用本地休斯顿出租房产数据
    const properties = data.properties;
    // console.log("data", data, "data");
    res.write(
      JSON.stringify({ step: 2, answer: "房产信息已获取，正在分析数据维度" }) +
        "\n"
    );

    //请求数据集中坐标的名称，作为xy值
    const list = propertyModel.getKeys(properties);
    response = await AIModel.dimensionFromDS(list, question);
    let dimension, x, xParent, y, yParent;

    if (!response.stateCode || response.stateCode != 1) {
      res.end(
        JSON.stringify({
          step: 3,
          answer: response.answer,
        }) + "\n"
      );
      return;
    } else {
      dimension = response.answer;
      x = propertyModel.getChildAndParent(dimension.x).child;
      y = propertyModel.getChildAndParent(dimension.y).child;
      xParent = propertyModel.getChildAndParent(dimension.x).parent;
      yParent = propertyModel.getChildAndParent(dimension.y).parent;
      // console.log("dimension", dimension);
      res.write(
        JSON.stringify({
          step: 3,
          answer: "信息维度分析完成，正在处理数据",
          dimension,
        }) + "\n"
      );
    }

    //调用PropertyModel对房产信息进行过滤
    const mappedData = propertyModel.mappedData(
      properties,
      x,
      y,
      null,
      xParent,
      yParent,
      null
    );
    // console.log("mappedData", mappedData);
    res.write(
      JSON.stringify({
        step: 4,
        answer: "数据处理完成，正在分析结果",
        data: mappedData,
        x,
        y,
      }) + "\n"
    );
    //调用AI描述接口，对房产信息进行描述
    response = await AIModel.descriptionFromDS(mappedData, question);
    console.log("aiResponse", response);
    if (!response.stateCode || response.stateCode != 1) {
      console.log("end branch answer", response.answer);
      res.end(
        JSON.stringify({
          step: 5,
          answer: response.answer,
        }) + "\n"
      );
      return;
    } else {
      const description = response.answer;
      console.log("write branch answer", description);
      res.write(
        JSON.stringify({
          step: 5,
          answer: description,
          // answer: description,
        }) + "\n"
      );
    }

    res.end();
  } catch (err) {
    // res.writeHead(400, {
    //   "Content-Type": "application/json",
    // });
    res.end(JSON.stringify({ err: err.message }));
  }
};

module.exports = {
  saveTheChat,
  deleteTheChat,
  updateChatHistory,
  getChatHistroy,
  getSavedChats,
  getResponse,
};
