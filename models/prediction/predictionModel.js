//包括不同的预测方法，根据输入数据，生成预测函数
const math = require("mathjs");
const ARIMA = require("arima");
const tf = require("@tensorflow/tfjs");
const SVM = require("libsvm-js/asm");
const dataProcessingModel = require("../dataProcessingModel");
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

  //函数与非线性预测统一成输入数组，返回数组
  return (inputArr) => {
    // console.log("inputArr", inputArr);
    outputArr = inputArr.map((x) => {
      return coefficients.valueOf().reduce((sum, v, i) => {
        return sum + v * Math.pow(x, i);
      }, 0);
    });
    return outputArr;
  };
};

// 时间序列预测，ARIMA自回归积分移动平均模型，返回的函数中，输入预测数量n，输出接下来的n的预测的数组，需要输入x为等间隔的数据，表述y在时间上均匀分布
const ARIMAFunction = (data, p = 4, d = 4, q = 2) => {
  let ARIMALog;
  let stationary = true;

  const arima = new ARIMA({
    p, // 自回归项的阶数
    d, // 差分阶数
    q, // 移动平均项的阶数
    verbose: false, // 关闭详细日志
    // auto: true,
  });
  //数据处理，排序，生成时间序列
  data.sort((v1, v2) => v1.x - v2.x);
  data = data.map((v) => v.y);

  //训练模型并获取输出，判断是否稳定
  ARIMALog = JSON.stringify(arima.fit(data));
  // console.log("ARIMALog", ARIMALog, "ARIMALogEnd");
  if (ARIMALog.indexOf("non-stationary AR part") != -1) {
    stationary = false;
  }
  // console.log(ARIMALog);
  return {
    func: (n) => {
      //输入要预测的数量n
      const predictedArr = arima.predict(n);
      return predictedArr;
    },
    model: arima,
    stationary,
  };
};

//支持向量机回归模型
const SVMRegression = (data) => {
  const xArr = data.map((v) => [v.x]);
  console.log("xArr:", xArr);
  const yArr = data.map((v) => v.y);
  let {
    normalizedResult: normalizedInputs,
    min: inputMin,
    max: inputMax,
  } = dataProcessingModel.normalizedObject(xArr);
  normalizedInputs = normalizedInputs.map((v) => [v]);
  const {
    normalizedResult: normalizedOutputs,
    min: outputMin,
    max: outputMax,
  } = dataProcessingModel.normalizedObject(yArr);

  const svm = new SVM({
    type: SVM.SVM_TYPES.EPSILON_SVR,
    kernel: SVM.KERNEL_TYPES.RBF,
    cost: 1.0, // 降低 C 值
    epsilon: 0.0001, // 根据 y 的尺度调整
    gamma: 10, // 降低 gamma
  });
  svm.train(normalizedInputs, normalizedOutputs);
  // console.log(
  //   "训练数据input",
  //   normalizedInputs,
  //   "训练数据output",
  //   normalizedOutputs
  // );

  return {
    func: (inputArr) => {
      //按照svm要求，将一维元素数组转化为向量数组
      if (!Array.isArray(inputArr[0])) {
        inputArr = inputArr.map((v) => [v]);
      }
      // console.log("inputArr:", inputArr);
      const normalizedInput = dataProcessingModel
        .normalizedObject(inputArr, inputMin, inputMax)
        .normalizedResult.map((v) => [v]);
      const predictedResult = svm.predict(normalizedInput);
      const denormalizedResult = dataProcessingModel.denormalizedObject(
        predictedResult,
        outputMin,
        outputMax
      );
      return denormalizedResult;
    },
    free: () => svm.free(), // 让外部决定何时释放
  };
};

//反向传播机器学习模型，输入数据，返回预测函数
const BPNetworkFunction = async (
  data,
  epochs = 100,
  hiddenUnits = 100,
  degree = 3
) => {
  data = data.filter((v) => v.x != null && v.y != null);
  //对数据进行处理，转化为张量并归一化
  const xArr = data.map((v) => v.x);
  const yArr = data.map((v) => v.y);
  // console.log("xArr:", xArr);

  // const polyXArr = polynomialFeatures(xArr, degree); // 生成 x, x^2, x^3

  const {
    normalizedResult: normalizedInputs,
    min: inputMin,
    max: inputMax,
  } = dataProcessingModel.normalizedTensor(xArr);
  const {
    normalizedResult: normalizedOutputs,
    min: outputMin,
    max: outputMax,
  } = dataProcessingModel.normalizedTensor(yArr);

  // 创建 BP 神经网络模型
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [xArr[0].length || 1],
      // inputShape: [degree],
      units: hiddenUnits,
      activation: "tanh",
    })
  );
  model.add(tf.layers.dense({ units: hiddenUnits, activation: "tanh" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // 线性回归任务，使用 linear 激活

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
        // console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss}`);
      },
    },
  });

  const func = (inputArr) => {
    inputArr = inputArr.map((v) => [Number(v)]);
    // const polyInputArr = polynomialFeatures(inputArr, degree);
    //记住预测阶段，归一化都要根据训练阶段的缩放比例
    const normalizedInput = dataProcessingModel.normalizedTensor(
      inputArr,
      inputMin,
      inputMax
    ).normalizedResult;
    const predictedResult = model.predict(normalizedInput);
    const denormalizedResult = dataProcessingModel.denormalizedObject(
      predictedResult,
      outputMin,
      outputMax
    );
    return denormalizedResult;
  };

  return func;
};

// //BP神经网络添加多项式回归
// const polynomialFeatures = (xArr, degree) => {
//   return xArr.map((x) => {
//     return Array.from({ length: degree }, (_, i) => Math.pow(x, i + 1));
//   });
// };

module.exports = {
  linearRegressionFunction,
  polynomialRegressionFunction,
  ARIMAFunction,
  BPNetworkFunction,
  SVMRegression,
};
