//包括不同的预测方法，根据输入数据，生成预测函数
const math = require("mathjs");
const ARIMA = require("arima");
const tf = require("@tensorflow/tfjs");
// import * as tf from "@tensorflow/tfjs-node";

//一元的线性回归模型，用公式计算最小二乘法函数。返回预测函数。
const linearRegressionFunction = (data) => {
  let n = data.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumXX += data[i].x * data[i].x;
  }

  let s = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX); //slope斜率
  let i = (sumY - s * sumX) / n; //intercept截距

  return (x) => s * x + i;
};

//输入原始数据和多项式的项数两个参数，输出系数
const polynomialRegressionFunction = (data, degree) => {
  const xValues = data.map((v) => v.x);
  const yValues = data.map((v) => v.y);
  const m = data.length;

  // 构造 Vandermonde 矩阵 X对应的原数组
  const X = [];
  for (let i = 0; i < m; i++) {
    X.push([]);
    for (let j = 0; j <= degree; j++) {
      X[i].push(Math.pow(xValues[i], j));
    }
  }

  // 转换为 mathjs 矩阵对象，方便实用乘、转置、逆等方法
  const XMatrix = math.matrix(X);
  const yMatrix = math.matrix(yValues);

  // 计算正规方程: a = (X^T * X)^(-1) * X^T * y
  const XT = math.transpose(XMatrix);
  const XTX = math.multiply(XT, XMatrix);
  const XTX_inv = math.inv(XTX);
  const XTY = math.multiply(XT, yMatrix);
  const coefficients = math.multiply(XTX_inv, XTY);

  return (x) => {
    const y = coefficients.valueOf().reduce((sum, v, i) => {
      return sum + v * Math.pow(x, i);
    }, 0);
    return y;
  };
};

// ARIMA自回归积分移动平均模型，返回的函数中，输入预测数量n，输出接下来的n的预测的数组，需要输入x为等间隔的数据，表述y在时间上均匀分布
const ARIMAFunction = (data) => {
  const arima = new ARIMA({
    p: 4, // 自回归项的阶数
    d: 2, // 差分阶数
    q: 2, // 移动平均项的阶数
    // auto: true,
  });
  //数据处理，排序，生成时间序列
  data.sort((v1, v2) => v1.x - v2.x);
  data = data.map((v) => v.y);
  arima.fit(data);

  return (n) => {
    //输入要预测的数量，
    const predictedArr = arima.predict(n);
    return predictedArr;
  };
};

//将时间序列预测的数据转化格式，拼接到对象数组中
const arrConcatenatedData = (data, arr, n = null) => {
  let objectArr = [];
  if (Array.isArray(n)) {
    objectArr = arr.map((v, i) => {
      const x = n[i];
      const y = v;
      return { x, y };
    });
  } else {
    let avarageGap = 0;
    for (let i = 1; i < data.length - 1; i++) {
      avarageGap += data[i].x - data[i - 1].x;
    }
    avarageGap /= data.length - 2;
    objectArr = arr.map((v, i) => {
      const x = data[data.length - 1].x + (i + 1) * avarageGap;
      const y = v;
      return { x, y };
    });
  }

  const newData = data.concat(objectArr);
  return newData;
};

// 将数组转为归一化的张量
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

const denormalizedObject = (normalizedTensor, min, max) => {
  const denormalizedResult = normalizedTensor.mul(max.sub(min)).add(min);
  return denormalizedResult.arraySync().flat();
};
//反向传播机器学习模型，输入数据，返回预测函数
const BPNetworkFunction = async (data, epochs = 100, hiddenUnits = 100) => {
  //对数据进行处理，转化为张量并归一化
  const xArr = data.map((v) => v.x);
  const yArr = data.map((v) => v.y);
  const {
    normalizedResult: normalizedInputs,
    min: inputMin,
    max: inputMax,
  } = normalizedTensor(xArr);
  const {
    normalizedResult: normalizedOutputs,
    min: outputMin,
    max: outputMax,
  } = normalizedTensor(yArr);

  // 创建 BP 神经网络模型
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [xArr[0].length || 1],
      units: hiddenUnits,
      activation: "tanh",
    })
  );
  model.add(tf.layers.dense({ units: hiddenUnits, activation: "tanh" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" })); // 线性回归任务，使用 linear 激活

  // 编译模型
  model.compile({
    optimizer: tf.train.adam(),
    loss: "meanSquaredError",
  });

  await model.fit(normalizedInputs, normalizedOutputs, {
    epochs: epochs,
    batchSize: 8,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss}`);
      },
    },
  });

  const func = (inputArr) => {
    //记住预测阶段，归一化都要根据训练阶段的缩放比例
    const normalizedInput = normalizedTensor(
      inputArr,
      inputMin,
      inputMax
    ).normalizedResult;
    const predictedResult = model.predict(normalizedInput);
    const denormalizedResult = denormalizedObject(
      predictedResult,
      outputMin,
      outputMax
    );
    return denormalizedResult;
  };

  return func;
};

//BP神经网络添加多项式回归
const polynomialFeatures = (xArr, degree) => {
  return xArr.map((x) => {
    return Array.from({ length: degree }, (_, i) => Math.pow(x, i + 1));
  });
};

module.exports = {
  linearRegressionFunction,
  polynomialRegressionFunction,
  ARIMAFunction,
  arrConcatenatedData,
  BPNetworkFunction,
};
