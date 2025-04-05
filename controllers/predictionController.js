const predictionModel = require("../models/prediction/predictionModel");
const selectionModel = require("../models/prediction/selectionModel");
const evaluationModel = require("../models/prediction/evaluationModel");
const dataProcessingModel = require("../models/dataProcessingModel");

//线性回归预测，返回输入数据和预测数据
const linearRegressionPredict = (req, res) => {
  const { data, n } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0 || n.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组");
  } else {
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    const func = predictionModel.linearRegressionFunction(xyData);
    for (let v of n) {
      xyData.push({ x: v, y: func(v) });
    }
    const originData = convertProps.origin(xyData);
    return res.status(200).json(originData);
  }
};

// 多项式回归预测，返回输入数据和预测数据
const polynomialRegressionPredict = (req, res) => {
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    const degree = 2;
    const n = dataProcessingModel.getPredictedX(xyData);
    console.log("n", n);
    const func = predictionModel.polynomialRegressionFunction(xyData, degree);
    const predictedArr = func(n);
    console.log("predictedArr", predictedArr);
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr,
      n
    );
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
  }
};

// 不指定项数的多项式回归预测，返回输入数据和预测数据
const optimizedPolynomialRegressionPredict = (req, res) => {
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    const n = dataProcessingModel.getPredictedX(xyData);
    console.log("n", n);
    const bestFittingModel = selectionModel.bestFittingModel(xyData);
    console.log("bestFittingModel", bestFittingModel);
    const func = bestFittingModel.func;
    const predictedArr = func(n);
    console.log("predictedArr", predictedArr);
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr,
      n
    );
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
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
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const n = dataProcessingModel.getPredictedX(data, 1);
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    const func = predictionModel.ARIMAFunction(xyData).func;
    // const stationary = predictionModel.ARIMAFunction(xyData).stationary;
    //返回和data的{x,y}相同的格式

    // console.log("n", n);
    const predictedArr = func(n)[0]; //第一个是预测结果，第二个是误差
    console.log("func(n)", func(n));
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr
    );
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
  }
};

//ARMIA时间序列预测
const optimizedARIMAPredict = (req, res) => {
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const n = dataProcessingModel.getPredictedX(data, 1);
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    const func = selectionModel.optimizedARIMAModel(data).func;
    // const list = selectionModel.optimizedARIMAModel(xyData);
    //返回和data的{x,y}相同的格式
    const predictedArr = func(n)[0]; //第一个是预测结果，第二个是误差
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr
    );
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
  }
};

// 神经网络
// 输入要预测的数组n，其中包括要预测的元素，可以是多维数组
const BPNetworkPredict = async (req, res) => {
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在空数组，引发错误");
  } else {
    let n = dataProcessingModel.getPredictedX(data);
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    console.log("xyData", xyData);
    const func = await predictionModel.BPNetworkFunction(xyData, 200, 100);
    //返回和data的{x,y}相同的格式
    const predictedArr = await func(n);
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr,
      n
    );
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
  }
};

//支持向量回归，输入要预测数组，返回xy对象数组
const SVMRegressionPredict = async (req, res) => {
  let { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const n = dataProcessingModel.getPredictedX(data);
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    // const SVMRegression = predictionModel.SVMRegression(xyData);
    const func = predictionModel.SVMRegression(xyData).func;
    const predictedArr = await func(n);
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr,
      n
    );
    // SVMRegression.free();
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
  }
};

//综合模型预测
const optimizedPredict = async (req, res) => {
  const { data } = req.body; //n是要预测的数组，也就是x的数组
  if (data.length === 0) {
    return res.status(400).json("controller收到的参数存在非数组，引发错误");
  } else {
    const convertProps = dataProcessingModel.convertProps(data);
    let xyData = convertProps.xy();
    console.log("xyData", xyData);

    const optimizedModel = await selectionModel.optimizedModel(xyData);
    // console.log("optimizedModel", JSON.stringify(optimizedModel));
    const func = optimizedModel.func;
    const n = optimizedModel.n;
    console.log("n", n);

    let predictedArr = await func(n);
    if (Array.isArray(predictedArr[0])) {
      predictedArr = predictedArr[0];
    }
    // console.log("predictedArr", predictedArr);
    //将n和预测的结果predictedArr拼接到数组xyData
    const newData = dataProcessingModel.arrConcatenatedData(
      xyData,
      predictedArr,
      n
    );
    const originData = convertProps.origin(newData);
    return res.status(200).json(originData);
  }
};

module.exports = {
  linearRegressionPredict,
  polynomialRegressionPredict,
  optimizedPolynomialRegressionPredict,
  testEvaluationModel,
  ARIMAPredict,
  optimizedARIMAPredict,
  BPNetworkPredict,
  SVMRegressionPredict,
  optimizedPredict,
};
