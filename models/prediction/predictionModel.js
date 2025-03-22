//包括不同的预测方法，根据输入数据，生成预测函数
const math = require("mathjs");

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
function polynomialRegressionFunction(data, degree) {
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
}

// 多项式回归，用不同的项数生成模拟数据。通过比较模拟数据的贴合度，来确定最优的项数

module.exports = { linearRegressionFunction, polynomialRegressionFunction };
