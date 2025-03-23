const predictionModel = require("../models/prediction/predictionModel");
const selectionModel = require("../models/prediction/selectionModel");
const evaluationModel = require("../models/prediction/evaluationModel");

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

// 不指定项数的多项式回归预测，返回输入数据和预测数据
const bestFittingModelPredict = (req, res) => {
  const { data, n } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0 || n.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const bestFittingModel = selectionModel.bestFittingModel(data);
    const func = bestFittingModel.func;
    for (let v of n) {
      data.push({ x: v, y: func(v) });
    }
    return res.status(200).json(data);
  }
};

//测试计算拟合度模型
const testEvaluationModel = (req, res) => {
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const MSE = evaluationModel.MSE(
      data,
      data.map((v) => ({ x: v.x, y: 2 * v.y }))
    );
    const R2 = evaluationModel.R2(
      data,
      data.map((v) => ({ x: v.x, y: 2 * v.y }))
    );
    const underfittingDegree = evaluationModel.underfittingDegree(
      data,
      data.map((v) => ({ x: v.x, y: 2 * v.y }))
    );
    const AIC = evaluationModel.AIC(
      data,
      data.map((v) => ({ x: v.x, y: 2 * v.y })),
      3
    );
    const fittingDegree = evaluationModel.fittingDegree(
      data,
      data.map((v) => ({ x: v.x, y: 2 * v.y })),
      3
    );

    return res.status(200).json({ fittingDegree });
  }
};

//ARMIA时间序列预测
const ARIMAPredict = (req, res) => {
  const { data, n } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const func = predictionModel.polynomialRegressionFunction(data, n);
    //返回和data的{x,y}相同的格式
    const pridictedArr = func(n);
    const avarageGap =
      data.reduce((sum, v, i) => data[i + 1] - data[i] + sum, 0) / data.length;

    data.concat(func(n));

    return res.status(200).json(data);
  }
};

module.exports = {
  linearRegressionPredict,
  polynomialRegressionPredict,
  bestFittingModelPredict,
  testEvaluationModel,
  ARIMAPredict,
};
