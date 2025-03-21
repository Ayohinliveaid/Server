const predictionModel = require("../models/predictionModel");

//线性回归预测，返回输入数据和预测数据
const linearRegressionPredict = (req, res) => {
  const { data, n } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0 || n.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组");
  } else {
    const func = predictionModel.linearRegressionFunction(data);
    for (let v of n) {
      data.push({ x: v, y: func(v) });
    }
    return res.status(200).json(data);
  }
};

// 多项式回归预测，返回输入数据和预测数据
const polynomialRegressionPredict = (req, res) => {
  const { data, degree, n } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0 || n.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const func = predictionModel.polynomialRegressionFunction(data, degree);
    for (let v of n) {
      data.push({ x: v, y: func(v) });
    }
    return res.status(200).json(data);
  }
};

module.exports = { linearRegressionPredict, polynomialRegressionPredict };
