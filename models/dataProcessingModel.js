//数据处理模型
const jStat = require("jstat");
const tf = require("@tensorflow/tfjs");
//抽象出数据集的结构，首先简化数组，只保留第一个元素。使用广度优先算法。
const simplifyObj = (obj) => {
  let simplifiedObj = JSON.parse(JSON.stringify(obj));
  if (Array.isArray(simplifiedObj)) {
    simplifiedObj = simplifiedObj[0];
  } //第一个数组只能通过此处消除
  let queue = [simplifiedObj]; // 用队列来存储对象，首先将根对象入队
  while (queue.length > 0) {
    let current = queue.shift(); // 从队列中取出一个元素进行处理
    // 如果当前对象是普通对象，则遍历它的键值对
    if (typeof current === "object" && current !== null) {
      const keys = Object.keys(current);
      for (let v of keys) {
        // queue.push(current[v]); // 将子加入队列
        // console.log(v);
        if (Array.isArray(current[v]) && typeof current[v][0] !== "object") {
          // 如果是简单类型的数组，删除这个键，此位置仅对第二层元素有效，对obj是简单元素数组的情况无效，但现实中不存在obj是简单元素数组的情况。
          delete current[v];
        } else if (
          Array.isArray(current[v]) &&
          typeof current[v][0] == "object"
        ) {
          current[v] = current[v][0];
          queue.push(current[v]); // 将子元素加入队列
        } else {
          queue.push(current[v]); // 将子元素加入队列
        }
      }
    }
  }
  return simplifiedObj;
};
//将所有根部的属性列出来，组成一个字符串数组。输入一个对象，进行扁平化处理，再返回键名
const flattenObject = (obj, parentKey = "") => {
  let result = {};

  for (const key in obj) {
    const newKey = parentKey ? `${parentKey}.${key}` : key; // 拼接父键和当前键，使用点（.）作为分隔符
    if (typeof obj[key] === "object" && obj[key] !== null) {
      // 如果是对象且不是数组，递归调用
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      // 如果是简单值或数组，直接赋值
      result[newKey] = obj[key];
    }
  }
  return result;
};
//将数据化简成数据结构，并转化成层级属性的数组，嵌套了simplifyObj和flattenObject
const getKeys = (obj) => {
  const simplifiedObj = simplifyObj(obj);
  const result = Object.keys(flattenObject(simplifiedObj));
  return result;
};

//获取到AI返回的dimension后，拆解成字符串
const getChildAndParent = (str) => {
  const arr = str.split(".");
  const child = arr[arr.length - 1];
  const parent = arr[0];
  return { child, parent };
};

//深度优先算法，输入对象和参数，输出参数值
const DFS = (obj, key) => {
  const keys = Object.keys(obj);
  for (let v of keys) {
    if (typeof obj[v] == "object" && obj[v] != null) {
      const result = DFS(obj[v], key);
      if (result != "DFS now found") {
        return result;
      }
    } else {
      if (v.toString() == key) {
        return obj[v];
      }
    }
  }
  return "DFS now found";
};

const BFS = (obj, key) => {
  let queue = [obj]; // 用队列来存储对象，首先将根对象入队
  while (queue.length > 0) {
    const current = queue.shift(); // 从队列中取出一个元素进行处理

    // 如果当前对象是数组，则将其中的每一个元素加入队列
    if (Array.isArray(current)) {
      queue.push(...current);
    }

    // 如果当前对象是普通对象，则遍历它的键值对
    if (typeof current == "object" && current !== null) {
      const keys = Object.keys(current);
      for (let v of keys) {
        if (v == key) {
          return current[v]; // 找到目标键并返回其值
        }
        queue.push(current[v]); // 否则继续将其值加入队列
      }
    }
  }
  return `BFS ${key} not found`; // 如果队列遍历完还没找到，返回未找到信息
};

//先广度优先搜索，如果找到关键字，就深度优先搜索:address\location\ordinates
const search = (obj, key, parent = key) => {
  console.log("obj", obj, "key", key, "parent", parent);
  let queue = [obj]; // 用队列来存储对象，首先将根对象入队
  while (queue.length > 0) {
    const current = queue.shift(); // 从队列中取出一个元素进行处理
    // 如果当前对象是数组，则将其中的每一个元素加入队列
    if (Array.isArray(current)) {
      queue.push(...current);
    } else if (typeof current == "object" && current != "search not found") {
      // 如果当前对象是普通对象，则遍历它的键值对
      const keys = Object.keys(current);
      for (let v of keys) {
        if (v == key) {
          return current[v]; // 找到目标键并返回其值
        } else if (v == parent) {
          return BFS(current[v], key);
        } else {
          queue.push(current[v]); // 否则继续将其值加入队列
        }
      }
    }
  }
  return "search not found"; // 如果队列遍历完还没找到，返回未找到信息
};
//接口请求到数据后，映射为xyz坐标，进而可以在antv中展示。参数表示xyz需要映射的元素，对应parent表示快速查找的父级元素名称
const mappedData = (
  data,
  x,
  y,
  z = null,
  xParent = x,
  yParent = y,
  zParent = z
) => {
  let mappedResult = [];
  console.log(data);

  if (z == null) {
    mappedResult = data.map((v) => {
      return {
        [x]: search(v, x, xParent), //返回x的实际内容而不是'x'
        [y]: search(v, y, yParent),
      };
    });
  } else {
    mappedResult = data.map((v) => {
      return {
        [x]: search(v, x, xParent),
        [y]: search(v, y, yParent),
        [z]: search(v, z, zParent),
      };
    });
  }
  mappedResult.filter((v) => Object.values(v).every((value) => value != null));

  return mappedResult;
};

//数据的预处理方法，用于剔除异常值和噪声

//对需要预测的数据的分析方法，计算多种指标，选择能产生最好的效果的预测模型

//计算自相关性

//计算线性：皮尔逊相关系数，返回绝对值，如果>0.7，说明线性关系，返回是否有线性关系true/false
const pearsonCorrelation = (data) => {
  const n = data.length;
  const x = data.map((v) => v.x);
  const y = data.map((v) => v.y);

  if (x.length !== y.length) {
    throw new Error("Arrays must have the same length");
  }

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }

  const denominator = Math.sqrt(varianceX * varianceY);
  const result = denominator === 0 ? 0 : numerator / denominator;
  if (Math.abs(result) > 0.7) {
    console.log("linear correlation", result);
    return true;
  } else {
    return false;
  }
};

//以下判断自相关性
//计算自相关系数，延迟K阶的，参数seires要求传入数组
const autocorrelation = (series, lag) => {
  const n = series.length;
  if (lag >= n) {
    throw new Error("Lag is too large for the dataset");
  }

  const mean = series.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  for (let i = 0; i < n - lag; i++) {
    numerator += (series[i] - mean) * (series[i + lag] - mean);
  }

  let denominator = 0;
  for (let i = 0; i < n; i++) {
    denominator += Math.pow(series[i] - mean, 2);
  }

  return denominator === 0 ? 0 : numerator / denominator;
};
//从库中获取卡方分布的临界值
const getChiSquaredCriticalValue = (df, alpha) => {
  return jStat.chisquare.inv(1 - alpha, df);
};

//ljung-box检验，返回是否具有自相关性，true/flase
const ljungBoxTest = (data, maxLag) => {
  const y = data.map((v) => v.y);
  const n = data.length;
  let Q = 0;

  // 计算前maxLag个滞后期的自相关系数
  for (let lag = 1; lag <= maxLag; lag++) {
    const acf = autocorrelation(y, lag);
    console.log(lag, acf);
    Q += (n * (n + 2) * Math.pow(acf, 2)) / (n - lag);
  }
  // self-defined Significance level
  const alpha = 0.01;

  const criticalValue = getChiSquaredCriticalValue(maxLag, alpha);
  console.log("ljungBoxQ", Q);
  console.log("criticalValue", criticalValue);

  if (Q > criticalValue) {
    console.log("autocorrelation, reject the null hypothesis");
    return true;
  } else {
    console.log("none-autocorrelation, fail to reject the null hypothesis");
    return false;
  }
};

// const data = [
//   { x: 1, y: 105 },
//   { x: 2, y: 107 },
//   { x: 3, y: 110 },
//   { x: 4, y: 108 },
//   { x: 5, y: 115 },
//   { x: 6, y: 120 },
//   { x: 7, y: 118 },
//   { x: 8, y: 125 },
//   { x: 9, y: 130 },
// ];
// ljungBoxTest(data, 1); // 示例数据

//对于预测数据，获取要预测x的值，输入一个data，返回要预测的x的数组，以输入的x平均间隔为基准的后面n/10个数
const getPredictedX = (data, isARIMA = 0) => {
  const dataN = data.length;
  const n = dataN < 10 ? 1 : Math.floor(dataN / 10);
  if (isARIMA == 1) {
    return n;
  } else {
    data.sort((v1, v2) => v1.x - v2.x);
    let avarageGap = 0;
    const predictedX = [];
    avarageGap = (data[dataN - 1].x - data[0].x) / (dataN - 1);
    for (let i = 1; i <= n; i++) {
      predictedX.push(data[dataN - 1].x + i * avarageGap);
    }
    return predictedX;
  }
};

//将时间序列预测的数据转化格式，拼接到对象数组中，n表示要预测x的数组或者数量，如果是数组，就作为参数传入
const arrConcatenatedData = (data, arr, n = null) => {
  data.sort((v1, v2) => v1.x - v2.x);
  let objectArr = [];
  //如果是数组推入数组中元素
  if (Array.isArray(n)) {
    objectArr = arr.map((v, i) => {
      const x = n[i];
      const y = v;
      return { x, y };
    });
  } else {
    // 如果是数量，推入等间距的数量的元素
    const dataN = data.length;
    let avarageGap = 0;
    avarageGap = (data[dataN - 1].x - data[0].x) / (dataN - 1);
    objectArr = arr.map((v, i) => {
      const x = data[dataN - 1].x + (i + 1) * avarageGap;
      const y = v;
      return { x, y };
    });
  }

  const newData = data.concat(objectArr);
  // const originData = convertProps(data).origin(newData);
  return newData;
};

// 将数组转为归一化的张量，输入二维数组或者一维数组
const normalizedTensor = (arr, min = null, max = null) => {
  const tensor = tf.tensor2d(arr, [arr.length, arr[0].length || 1]);
  if (min && max) {
  } else {
    max = tensor.max();
    min = tensor.min();
  }
  const normalizedResult = tensor.sub(min).div(max.sub(min));
  return { normalizedResult, max, min };
};
//不转化为张量，直接归一化
const normalizedObject = (arr, min = null, max = null) => {
  // 计算 min 和 max，如果没有提供的话
  if (min === null || max === null) {
    min = Math.min(...arr.flat());
    max = Math.max(...arr.flat());
  }

  // 归一化： (x - min) / (max - min)
  const normalizedResult = arr.map((value) => (value - min) / (max - min));
  return { normalizedResult, max, min };
};

//将张量反归一化，返回一维数组
const denormalizedObject = (normalizedObject, min, max) => {
  // const denormalizedResult = normalizedObject.mul(max.sub(min)).add(min);
  // return denormalizedResult.arraySync().flat();

  // 情况1：输入是 TensorFlow 张量
  if (normalizedObject instanceof tf.Tensor) {
    const denormalizedResult = normalizedObject.mul(max.sub(min)).add(min);
    return denormalizedResult.arraySync().flat();
  }

  // 情况2：输入是普通数组
  if (Array.isArray(normalizedObject)) {
    const range = max - min;
    return normalizedObject.map((v) => v * range + min);
  }
};

//处理数据，将属性转化为xy，再转化回原属性值，以便在各个预测函数中使用xy预测，但最后返回原始数据
const convertProps = (data) => {
  let xProp, yProp;
  for (let i in data) {
    if (data[i[0]] && data[i[1]]) {
      xProp = Object.keys(data[0])[0];
      yProp = Object.keys(data[0])[1];
    }
  }
  const xy = () => {
    const xyResult = data.map((v) => {
      return {
        x: v[xProp],
        y: v[yProp],
      };
    });
    return xyResult;
  };
  const origin = (xyData) => {
    const originResult = xyData.map((v) => {
      return {
        [xProp]: v.x,
        [yProp]: v.y,
      };
    });
    return originResult;
  };

  return { xy, origin }; //xy(),origin()即可得到对应数组
};

//数据预处理，将iso字符串判断并转化成可用时间
const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const isISO8601 = (str) => isoRegex.test(str);

//输入数组，对每一个元素的属性值进行检查，如果是iso8601，返回时间戳，否则返回原值
const isofy = (data) => {
  let isofiedData = data.map((v, i) => {
    const newItem = {};
    for (const key in v) {
      const value = v[key];
      newItem[key] = isISO8601(value) ? Date.parse(value) : value;
    }
    return newItem;
  });
  return isofiedData;
};

const preprocessedData = (data) => {
  console.log("isofy(data)", isofy(data));
  return isofy(data);
};

module.exports = {
  simplifyObj,
  getKeys,
  flattenObject,
  DFS,
  BFS,
  search,
  mappedData,
  getChildAndParent,
  pearsonCorrelation,
  ljungBoxTest,

  getPredictedX,
  arrConcatenatedData,
  normalizedTensor,
  normalizedObject,
  denormalizedObject,
  convertProps,
  preprocessedData,
};
