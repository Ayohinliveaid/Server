const axios = require("axios");
const OpenAI = require("openai");
const removeMd = require("remove-markdown");
// import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "sk-63d7e4db1dd34c7d8480f75aaf92f9fb",
});

//表示参数的可选列表
const paramList = [
  {
    name: "search",
    children: [
      {
        name: "forsale",
        children: [null, { name: "search", children: [null] }],
      },
      {
        name: "forrent",
        children: [null, { name: "search", children: [null] }],
      },
      {
        name: "forsole",
        children: [null, { name: "search", children: [null] }],
      },
    ],
  },
];
//AI上下文
//标注输出格式
const standardResponse = {
  path: "/search/forsale",
  params: {
    location: "houston ,tx",
    search_radius: "0",
  },
};
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
      "I am using 'https://realtor16.p.rapidapi.com', generate its parameters according to the folling JavaScript object" +
      JSON.stringify(paramList) +
      ",only return JSON object like " +
      JSON.stringify(standardResponse),
  },
];
const messagesOfDescription = [
  {
    role: "system",
    content:
      "Describe the json data of answer I provided in standard Mandarin Chinese, according to the question. Start with '该数据",
  },
];
const messageOfDimension = [
  {
    role: "system",
    content:
      "Select the attribute names from the provided dataset’s property list based on the natural language question and map them to the X and Y axes in the Chart G2 visualization" +
      ",only return JSON object like " +
      JSON.stringify(standardDimension),
  },
];

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
        messages: [...messagesOfConfig, newMessages],
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

//向AI提问货物数据描述。接受数据作为输入，输出对数据的描述。处理数据，生成自然语言。
const descriptionFromDS = (data, question) => {
  const dataMessages = {
    role: "user",
    content: typeof data === "string" ? data : JSON.stringify(data), // Only stringify objects
  };
  const questionMessages = {
    role: "user",
    content: question, // Only stringify objects
  };
  return new Promise((resolve, reject) => {
    openai.chat.completions
      .create({
        messages: [...messagesOfDescription, dataMessages, questionMessages],
        model: "deepseek-chat",
      })
      .then((completion) => {
        resolve(removeMd(completion.choices[0].message.content));
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//接受数据作为输入，输出对数据的描述。处理数据，生成自然语言。
const dimensionFromDS = (list, question) => {
  const newMessages = {
    role: "user",
    // content: JSON.stringify(data),
    // content: typeof question === "string" ? data : JSON.stringify(data), // Only stringify objects
    content: question + JSON.stringify(list),
  };
  return new Promise((resolve, reject) => {
    openai.chat.completions
      .create({
        messages: [...messageOfDimension, newMessages],
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
