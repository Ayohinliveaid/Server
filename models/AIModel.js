const axios = require("axios");
const OpenAI = require("openai");
const removeMd = require("remove-markdown");
// import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-63d7e4db1dd34c7d8480f75aaf92f9fb",
});

//表示数据API参数的结构
const paramList = [
  {
    name: "search",
    children: [
      {
        name: "forsale",
        children: [null, { name: "coordinates", children: [null] }],
      },
      {
        name: "forrent",
        children: [null, { name: "coordinates", children: [null] }],
      },
      {
        name: "forsole",
        children: [null, { name: "coordinates", children: [null] }],
      },
    ],
  },
];
//AI上下文
//标注输出格式
const standardConfig = {
  path: "/search/forsale",
  params: {
    location: "houston ,tx",
    search_radius: "0",
  },
};

//定义AI状态码
const stateCode = {
  1: "成功匹配",
  2: "问题存在缺陷，或者根本不构成一个问题，需要详细提问",
  3: "问题详细，但是超出了当前的选择范围",
};
//标准回复
const standardResponse = {
  stateCode: 0,
  answer: String || Object,
};
//AI状态码描述
const messageOfStateCode = [
  {
    role: "system",
    content:
      "to answer question provided later ,you have three state, each state has a correpondding code like following: " +
      JSON.stringify(stateCode) +
      // " . "+
      ". Don't use code 2 and 3 arbitrarily, give code 1 as possible as you can, and you must return json like this: " +
      JSON.stringify(standardResponse) +
      ",no attribute should be omitted. Put the explanation of the stateCode (if stateCode is not 1) or standard answer of follow-up questions in Chinese (if stateCode is 1) in the 'answer' attribute",
  },
];

//标注输出格式
const standardDimension = {
  x: "address.coordinates.lon",
  y: "address.coordinates.lat",
};
//每次对话的上下文，包括角色和文字内容
const messagesOfConfig = [
  {
    role: "system",
    content:
      "generate an api request config according to the following question" +
      JSON.stringify(paramList) +
      ",you must return JSON object like this standard config as the answer part, no attribute in the JSON object can be removed or added, and this configuration is applicable only within the United States" +
      JSON.stringify(standardConfig),
  },
];
const messagesOfDescription = [
  {
    role: "system",
    content:
      "Describe the json data following in standard Mandarin Chinese as the answer part, according to the question. Start with '该数据",
  },
];
const messageOfDimension = [
  {
    role: "system",
    content:
      "Select attributes from the following property list accroding to the question as the dimension of a dataset of a chart" +
      ", return JSON object like this as the answer part" +
      JSON.stringify(standardDimension),
  },
];
//设置AI状态

//向AI提问获取房地产API参数
const configFromDS = (text) => {
  let params = [];
  const newMessages = {
    role: "user",
    content: text,
  };
  return new Promise((resolve, reject) => {
    openai.chat.completions
      .create({
        messages: [...messageOfStateCode, ...messagesOfConfig, newMessages],
        model: "deepseek-chat",
        response_format: {
          type: "json_object",
        },
      })
      .then((completion) => {
        console.log(
          "Raw AI Response:",
          JSON.stringify(completion.choices[0].message.content)
        ); // 先看看 AI 具体返回
        resolve(JSON.parse(completion.choices[0].message.content));
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//向AI提问货物数据描述。接受数据作为输入，输出对数据的描述。处理数据，生成自然语言。
const descriptionFromDS = (data, question) => {
  const dataMessages = {
    role: "user",
    content: typeof data == "string" ? data : JSON.stringify(data), // Only stringify objects
  };
  const questionMessages = {
    role: "user",
    content: question, // Only stringify objects
  };
  console.log("questionMessages", questionMessages);
  console.log("dataMessages", dataMessages);
  return new Promise((resolve, reject) => {
    openai.chat.completions
      .create({
        messages: [
          ...messageOfStateCode,
          ...messagesOfDescription,
          dataMessages,
          questionMessages,
        ],
        model: "deepseek-chat",
      })
      .then((completion) => {
        let content = removeMd(completion.choices[0].message.content);
        console.log("Raw AI Response:", content); // 先看看 AI 具体返回了什么

        // **尝试提取 JSON 结构**
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          content = jsonMatch[0]; // 取出 JSON 部分
        }

        const jsonData = JSON.parse(content);
        resolve(jsonData);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//接受数据作为输入，输出对数据的描述。处理数据，生成自然语言。
const dimensionFromDS = (list, text) => {
  const newMessages = {
    role: "user",
    // content: JSON.stringify(data),
    // content: typeof text === "string" ? data : JSON.stringify(data), // Only stringify objects
    content: text + JSON.stringify(list),
  };
  return new Promise((resolve, reject) => {
    openai.chat.completions
      .create({
        messages: [...messageOfStateCode, ...messageOfDimension, newMessages],
        model: "deepseek-chat",
        response_format: {
          type: "json_object",
        },
      })
      .then((completion) => {
        resolve(JSON.parse(completion.choices[0].message.content));
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  configFromDS,
  descriptionFromDS,
  dimensionFromDS,
};
