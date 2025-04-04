//测试调用Cat信息API
const axios = require("axios");
const fs = require("fs");
const { constants } = require("http2");
const jStat = require("jstat");

const requestCatAPI = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://api.thecatapi.com/v1/images/search?limit=3&mime_types=png",
        {
          headers: {
            "x-api-key":
              "live_QTQoXsscFALX63br8NHnps2gMpgK0qiTiTNot1j6oVNcDDe2fdOzkZYfzcqDA8dK",
          },
        }
      )
      .then((response) => {
        const cats = response.data.map((cat) => ({
          id: cat.id,
          url: cat.url,
        }));
        resolve(cats);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const requestRealtorAPI = async (
  config = {
    path: "/search/forrent",
    params: {
      location: "New York, NY",
      search_radius: "0",
    },
  }
) => {
  try {
    const options = {
      method: "GET",
      url: "https://realtor16.p.rapidapi.com" + config.path,
      params: config.params,
      headers: {
        "x-rapidapi-key": "1bb531fc35mshb5941983f2319bcp1883acjsncebdc4d31faa",
        "x-rapidapi-host": "realtor16.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data : "API Request Failed"
    );
  }
};

const requestLocalJSON = async () => {
  try {
    // 读取文件内容
    const path = "/Users/ZhengZhixiang/Desktop/realtorAPI.json"; // 替换为你的实际路径
    const data = fs.readFileSync(path, "utf8");

    // 解析 JSON 数据
    const parsedData = JSON.parse(data);

    // console.log(parsedData.properties[0])

    // console.log(search(parsedData.properties[0], 'lon'))
    return parsedData;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  requestCatAPI,
  requestRealtorAPI,

  requestLocalJSON,
};
