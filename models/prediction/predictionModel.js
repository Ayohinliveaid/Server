//包括不同的预测方法，根据输入数据，生成预测函数
const math = require("mathjs");
const ARIMA = require("arima");

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

//多元线性回归

//多项式回归

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
    p: 1, // 自回归项的阶数
    d: 1, // 差分阶数
    q: 1, // 移动平均项的阶数
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

module.exports = {
  linearRegressionFunction,
  polynomialRegressionFunction,
  ARIMAFunction,
};
