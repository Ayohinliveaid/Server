//输入实际数据和预测数据，返回该预测模型对实际数据的拟合程度

//计算均方误差，输入实际和预测的两个数据集，返回均方误差，即使拟合数据包含预测值，也可以进行比较
const MSE = (realData, fittedData) => {
  const squareBias = realData.map((v, i) =>
    Math.pow(realData[i].y - fittedData[i].y, 2)
  );
  const result = squareBias.reduce((sum, v, i) => sum + v) / squareBias.length;
  return result;
};

//计算决定系数，输入两个数据集
const R2 = (realData, fittedData) => {
  const avg = realData.reduce((sum, v) => sum + v.y, 0) / realData.length;
  const squareAvgBias = realData.map((v, i) => Math.pow(v.y - avg, 2));
  const tot = squareAvgBias.reduce((sum, v, i) => sum + v, 0);
  if (MSE(realData, fittedData) == 0) {
    return 1;
  } else {
    const res = MSE(realData, fittedData) * realData.length;
    const result = 1 - res / tot;
    return result;
  }
};

//综合“欠拟合”程度，输入一个比例，综合均方误差和决定系数，越大表示越欠拟合，越低越好
const underfittingDegree = (realData, fittedData, portion = 0.5) => {
  const result =
    MSE(realData, fittedData) * portion -
    R2(realData, fittedData) * (1 - portion);
  return result;
};

// //计算赤池信息法则值，避免过拟合，越低越好。计算模型的参数个数 k，对应多项式回归中的项数。
// const AIC = (realData, fittedData, k) => {
//   // 1. 计算残差平方和
//   if (MSE(realData, fittedData) == 0) {
//     const residualSumOfSquares = MSE(realData, fittedData) * realData.length;
//     const epsilon = 1e-10;
//     const safeRSS = Math.max(residualSumOfSquares, epsilon);
//     const L =
//       (-realData.length / 2) *
//         Math.log((2 * Math.PI * safeRSS) / realData.length) -
//       safeRSS / (2 * Math.pow(realData.length, 2));

//     return 2 * k - 2 * Math.log(L);
//   } else {
//     const residualSumOfSquares = MSE(realData, fittedData) * realData.length;

//     //似然函数
//     const L =
//       (-realData.length / 2) *
//         Math.log((2 * Math.PI * residualSumOfSquares) / realData.length) -
//       residualSumOfSquares / (2 * Math.pow(realData.length, 2));

//     // const L =
//     //   (-realData.length / 2) *
//     //     Math.log((2 * Math.PI * safeRSS) / realData.length) -
//     //   safeRSS / (2 * Math.pow(realData.length, 2));

//     // const safeL = Math.max(Math.abs(L), 1e-10); // 避免log为负数
//     const safeL = Math.max(L, 1e10); // 确保 L 不会过小，避免 log(负数)
//     const result = 2 * k - 2 * Math.log(safeL);
//     return result;
//   }
// };

//计算简化版赤池信息法则公式
const AIC = (realData, fittedData, k) => {
  const n = realData.length;

  // 计算 RSS
  const rss = realData.reduce((sum, y_i, index) => {
    const y_hat_i = fittedData[index];
    return sum + Math.pow(y_i.y - y_hat_i.y, 2);
  }, 0);

  // 代入 AIC = 2k + n * log(RSS / n)
  const aic = 2 * k + n * Math.log(rss / n);

  return aic;
};

//综合拟合程度，对欠拟合程度和过拟合程度进行加权平均，越高越好
const fittingDegree = (realData, fittedData, k, portion = 0.5) => {
  const result = -(
    portion * underfittingDegree(realData, fittedData, portion) +
    (1 - portion) * AIC(realData, fittedData, k)
  );
  return result;
};

module.exports = { MSE, R2, underfittingDegree, AIC, fittingDegree };
