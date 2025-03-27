//测试调用Cat信息API
const axios = require("axios");
const fs = require("fs");

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
        "x-rapidapi-key": "a545200318mshe35b1e4f95b4289p1a0053jsn086ecbe98a85",
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

//深度优先算法，输入对象和参数，输出参数值
const DFS = (obj, key) => {
  const keys = Object.keys(obj);
  for (let v of keys) {
    if (typeof obj[v] == "object" && obj[v] !== null) {
      const result = DFS(obj[v], key);
      if (result !== "haha") {
        return result;
      }
    } else {
      if (v.toString() == key) {
        return obj[v];
      }
    }
  }
  return "haha";
};
// const DFS = (obj, key) => {
//     if (Array.isArray(obj)) {
//         for (let item of obj) {
//             const result = DFS(item, key);
//             if (result !== 'haha') {
//                 return result;
//             }
//         }
//     } else {
//         const keys = Object.keys(obj);
//         for (let v of keys) {
//             if (typeof obj[v] === 'object' && obj[v] !== null) {
//                 const result = DFS(obj[v], key);
//                 if (result !== 'haha') {
//                     return result;
//                 }
//             } else {
//                 if (v === key) {
//                     return obj[v];
//                 }
//             }
//         }
//     }
//     return 'haha';
// }

const BFS = (obj, key) => {
  let queue = [obj]; // 用队列来存储对象，首先将根对象入队
  while (queue.length > 0) {
    const current = queue.shift(); // 从队列中取出一个元素进行处理

    // 如果当前对象是数组，则将其中的每一个元素加入队列
    if (Array.isArray(current)) {
      queue.push(...current);
    }

    // 如果当前对象是普通对象，则遍历它的键值对
    if (typeof current === "object" && current !== null) {
      const keys = Object.keys(current);
      for (let v of keys) {
        if (v === key) {
          return current[v]; // 找到目标键并返回其值
        }
        queue.push(current[v]); // 否则继续将其值加入队列
      }
    }
  }
  return "Key not found"; // 如果队列遍历完还没找到，返回未找到信息
};

//先广度优先搜索，如果找到关键字，就深度优先搜索:address\location\ordinates
const search = (obj, key) => {
  let queue = [obj]; // 用队列来存储对象，首先将根对象入队
  while (queue.length > 0) {
    const current = queue.shift(); // 从队列中取出一个元素进行处理
    // 如果当前对象是数组，则将其中的每一个元素加入队列
    if (Array.isArray(current)) {
      queue.push(...current);
    } else if (typeof current === "object" && current !== null) {
      // 如果当前对象是普通对象，则遍历它的键值对
      const keys = Object.keys(current);
      for (let v of keys) {
        if (v == key) {
          return current[v]; // 找到目标键并返回其值
        } else if (v == "address" || v == "location" || v == "coordinate") {
          return BFS(current[v], key);
        } else {
          queue.push(current[v]); // 否则继续将其值加入队列
        }
      }
    }
  }
  return null; // 如果队列遍历完还没找到，返回未找到信息
};

const path = "/Users/ZhengZhixiang/Desktop/realtorAPI.json"; // 替换为你的实际路径
const requestLocalJSON = async () => {
  try {
    // 读取文件内容
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

//接口请求到数据后，映射为xyz坐标，进而可以在antv中展示。参数表示xyz需要映射的元素
const mappedData = (data, x, y, z = null) => {
  let mappedResult = [];
  if (z == null) {
    mappedResult = data.map((v) => {
      return {
        x: search(v, x),
        y: search(v, y),
      };
    });

    mappedResult = mappedResult.filter((v) => v.x != null && v.y != null);
  } else {
    mappedResult = data.map((v) => {
      return {
        x: search(v, x),
        y: search(v, y),
        z: search(v, z),
      };
    });
    mappedResult = mappedResult.filter(
      (v) => v.x != null && v.y != null && v.z != null
    );
  }

  return mappedResult;
};

//映射算法，转化成antv框架可用的参数

// requestLocalJSON();

module.exports = {
  requestCatAPI,
  requestRealtorAPI,
  requestLocalJSON,
  DFS,
  BFS,
  search,
  mappedData,
};
