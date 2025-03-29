const axios = require("axios");
const OpenAI = require("openai");
const removeMd = require('remove-markdown');
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
//剩余参数
const propertyParam = {
  name: "property",
  children: [
    { name: "details", children: [null] },
    { name: "photos", children: [null] },
    { name: "estimates", children: [null] },
    { name: "amenities_score", children: [null] },
    { name: "similar_homes", children: [null] },
    { name: "new_construction_similar_homes", children: [null] },
    { name: "history", children: [null] },
    { name: "environment_risk", children: [null] },
    { name: "schools", children: [null] },
    { name: "market_trends", children: [null] },
  ],
};
//标注输出格式
const standardResponse = {
  path: "/search/forsale",
  params: {
    location: "houston ,tx",
    search_radius: "0",
  },
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
      "Describe the json data I provided in standard Mandarin Chinese",
  },
];

//处理自然语言，生成房产API查询参数，直接返回对象，作为房产API的参数
// {
//   "path": "/search/forrent",
//   "params": {
//       "location": "new york, ny",
//       "search_radius": "0"
//   }
// }
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

//处理自然语言，生成房产API查询参数
const paramArrFromText = (text) => {
  let params = [];
  const demand = "";

  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://chatgpt-42.p.rapidapi.com/chat",
      headers: {
        "x-rapidapi-key": "a545200318mshe35b1e4f95b4289p1a0053jsn086ecbe98a85",
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
        model: "gpt-4o-mini",
      },
    };
    axios
      .request(options)
      .then((response) => {
        resolve(response.data.choices[0].message.content);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//接受数据作为输入，输出对数据的描述。处理数据，生成自然语言。
const descriptionFromDS = (data) => {
  const newMessages = {
    role: "user",
    // content: JSON.stringify(data),
    content: typeof data === "string" ? data : JSON.stringify(data), // Only stringify objects

  };
  return new Promise((resolve, reject) => {
    openai.chat.completions
      .create({
        messages: [...messagesOfDescription,newMessages],
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



module.exports = {
  paramArrFromText,
  configFromDS,
  descriptionFromDS
};
