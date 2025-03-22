//输入实际数据和预测数据，返回该预测模型对实际数据的拟合程度

//计算均方误差，输入实际和预测的两个数据集，返回均方误差，即使拟合数据包含预测值，也可以进行比较
const MSE = (realData, predictedData) => {
  const squareBias = realData.map((v, i) =>
    Math.pow(realData[i] - predictedData[i], 2)
  );
  const result = squareBias.reduce((sum, v, i) => sum + v) / squareBias.length;
  return result;
};

//计算决定系数，输入两个数据集
const R2 = (realData, predictedData) => {
  const avg = realData.reduce((sum, v) => sum + v) / realData.length;
  const squareAvgBias = realData.map((v, i) => Math.pow(v - avg, 2));
  const res = squareAvgBias.reduce((sum, v, i) => sum + v);
  const tot = MSE(realData, predictedData) * realData.length;
  const result = 1 - res / tot;
  return result;
};

//综合“欠拟合”程度，输入一个比例，综合均方误差和决定系数，越大表示越欠拟合
const underfittingDegree = (realData, predictedData, portion = 0.5) => {
  const result =
    MSE(realData, predictedData) * portion -
    R2(realData, predictedData) * (1 - portion);
  return result;
};

//计算赤池信息法则值，避免过拟合，越低于好。计算模型的参数个数 k，对应多项式回归中的项数。
const AIC = (realData, predictedData, k) => {
  // 1. 计算残差平方和
  const residualSumOfSquares = MSE(realData, predictedData) * realData.length;
  //似然函数
  const L =
    (-realData.length / 2) *
      Math.log((2 * Math.PI * residualSumOfSquares) / realData.length) -
    residualSumOfSquares / (2 * Math.pow(realData.length, 2));
  const result = 2 * k - 2 * Math.log(L);
  return result;
};

//综合拟合程度，对欠拟合程度和过拟合程度进行加权平均，越高越好
const fittingDegree = (realData, predictedData, k, portion = 0.5) => {
  const result = -(
    portion * underfittingDegree(realData, predictedData, portion) +
    (1 - portion) * AIC(realData, predictedData, k)
  );
  return result;
};

module.exports = { fittingDegree };
