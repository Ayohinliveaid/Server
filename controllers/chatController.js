const chatModel = require("../models/chatModel");
const AIModel = require("../models/AIModel");
const propertyModel = require("../models/propertyModel");

const saveTheChat = async (req, res) => {
  try {
    const { chat, user } = req.body;
    await chatModel.saveChatToSavedChats(chat, user);
    await chatModel.updateSavedState(chat);
    return res.status(200).json({ message: "保存成功" });
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
      await chatModel.deleteChat(rows[0].id);
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
    const { question } = req.body;
    const config = await AIModel.configFromDS(question);
    console.log("config", config);

    // //构造房产API的路由并请求获得房产信息
    // const data = await propertyModel.requestRealtorAPI(config);
    const data = await propertyModel.requestLocalJSON(config); //节约API，暂时使用本地休斯顿出租房产数据
    const properties = data.properties;
    // console.log("data", data, "data");

    //请求数据集中坐标的名称，作为xy值
    const list = propertyModel.getKeys(properties);
    const dimension = await AIModel.dimensionFromDS(list, question);
    const x = propertyModel.getChildAndParent(dimension.x).child;
    const y = propertyModel.getChildAndParent(dimension.y).child;
    const xParent = propertyModel.getChildAndParent(dimension.x).parent;
    const yParent = propertyModel.getChildAndParent(dimension.y).parent;
    console.log("dimension", dimension);

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
    console.log("mappedData", mappedData);

    //调用AI描述接口，对房产信息进行描述
    const description = await AIModel.descriptionFromDS(mappedData, question);
    console.log("description", description);

    // const mappedData = [
    //   {
    //     x: 40.789436,
    //     y: -73.94297,
    //   },
    //   {
    //     x: 40.735008,
    //     y: -73.960876,
    //   },
    //   {
    //     x: 40.674236,
    //     y: -73.874863,
    //   },
    //   {
    //     x: 40.590847,
    //     y: -73.969482,
    //   },
    //   {
    //     x: 40.746044,
    //     y: -73.976563,
    //   },
    //   {
    //     x: 40.80291,
    //     y: -73.93544,
    //   },
    //   {
    //     x: 40.61432,
    //     y: -74.142886,
    //   },
    //   {
    //     x: 40.550677,
    //     y: -74.189202,
    //   },
    //   {
    //     x: 40.704099,
    //     y: -73.83537,
    //   },
    //   {
    //     x: 40.613445,
    //     y: -73.996651,
    //   },
    //   {
    //     x: 40.524757,
    //     y: -74.214233,
    //   },
    //   {
    //     x: 40.761029178681,
    //     y: -73.998786264561,
    //   },
    //   {
    //     x: 40.637894,
    //     y: -74.014641,
    //   },
    //   {
    //     x: 40.691936,
    //     y: -73.907135,
    //   },
    //   {
    //     x: 40.868252,
    //     y: -73.895226,
    //   },
    //   {
    //     x: 40.759834,
    //     y: -73.993584,
    //   },
    //   {
    //     x: 40.721462,
    //     y: -73.75943,
    //   },
    //   {
    //     x: 40.633438,
    //     y: -73.993553,
    //   },
    //   {
    //     x: 40.71405,
    //     y: -74.012878,
    //   },
    //   {
    //     x: 40.710244,
    //     y: -73.846721,
    //   },
    //   {
    //     x: 40.786997,
    //     y: -73.954008,
    //   },
    //   {
    //     x: 40.784657,
    //     y: -73.775795,
    //   },
    //   {
    //     x: 40.674442,
    //     y: -73.97998,
    //   },
    //   {
    //     x: 40.781147,
    //     y: -73.982094,
    //   },
    //   {
    //     x: 40.678711,
    //     y: -73.783285,
    //   },
    //   {
    //     x: 40.71566,
    //     y: -74.007828,
    //   },
    //   {
    //     x: 40.68541,
    //     y: -73.98037,
    //   },
    //   {
    //     x: 40.694834,
    //     y: -73.774163,
    //   },
    //   {
    //     x: 40.683957,
    //     y: -73.838928,
    //   },
    //   {
    //     x: 40.758713,
    //     y: -73.996368,
    //   },
    //   {
    //     x: 40.738567,
    //     y: -74.002678,
    //   },
    //   {
    //     x: 40.679996,
    //     y: -73.91806,
    //   },
    //   {
    //     x: 40.769772,
    //     y: -73.78199,
    //   },
    //   {
    //     x: 40.762852,
    //     y: -73.977305,
    //   },
    //   {
    //     x: 40.76276,
    //     y: -73.977234,
    //   },
    //   {
    //     x: 40.76376,
    //     y: -73.965378,
    //   },
    //   {
    //     x: 40.746504,
    //     y: -73.75462,
    //   },
    //   {
    //     x: 40.704592,
    //     y: -73.835453,
    //   },
    //   {
    //     x: 40.714782,
    //     y: -73.937782,
    //   },
    //   {
    //     x: 40.758713,
    //     y: -73.996368,
    //   },
    //   {
    //     x: 40.773418,
    //     y: -73.989601,
    //   },
    //   {
    //     x: 40.601707,
    //     y: -74.006363,
    //   },
    //   {
    //     x: 40.677035,
    //     y: -73.982752,
    //   },
    //   {
    //     x: 40.758713,
    //     y: -73.996365,
    //   },
    //   {
    //     x: 40.775037,
    //     y: -73.990004,
    //   },
    //   {
    //     x: 40.577442,
    //     y: -73.838074,
    //   },
    //   {
    //     x: 40.698135,
    //     y: -73.927925,
    //   },
    //   {
    //     x: 40.604924,
    //     y: -74.012981,
    //   },
    //   {
    //     x: 40.804256,
    //     y: -73.961349,
    //   },
    //   {
    //     x: 40.718855,
    //     y: -73.948774,
    //   },
    // ];
    // const description =
    //   "这是一个包含12个数据点的JSON数组，每个数据点由x和y两个属性组成。具体描述如下： 当x=1时，y=105 当x=2时，y=107 当x=3时，y=110 当x=4时，y=108 当x=5时，y=115 当x=6时，y=120 当x=7时，y=118 当x=8时，y=125 当x=9时，y=130 当x=10时，y=128 当x=11时，y=135 当x=12时，y=140 整体来看，随着x值的增加，y值呈现波动上升的趋势。其中： x值从1到12连续递增 y值在105到140之间变化 虽然个别点有轻微回落（如x=4时y比x=3时略降），但总体保持增长态势";

    return res
      .status(200)
      .json({ data: mappedData, answer: description, x, y });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }
};

module.exports = {
  saveTheChat,
  updateChatHistory,
  getChatHistroy,
  getSavedChats,
  getResponse,
};
