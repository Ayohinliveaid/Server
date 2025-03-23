// 输入原数据，测试预测模型中所有的预测方法，生成对原数据的拟合数据，再调用评价模型对各拟合方法进行打分，返回得分最高的模型。

const predictionModel = require("./predictionModel");
const evaluationModel = require("./evaluationModel");
const { json } = require("express");

//调用评价模型，对各个预测方法生成的拟合数据进行评分，

const bestFittingModel = (data) => {
  //首先调用测试模型中所有预测方法，生成相应的拟合数据，具体来说，是多项式回归的方法中，使用不同的方法作为项数
  const degrees = [...Array(4)].map((v, i) => i + 1); //多项式回归，项数的范围

  //预测方法对象，包括多项式项数，具体的预测函数，原数据，生成的拟合数据，获得的分数，生成一个预测方法对象的数组，来保存
  const predictionModelList = degrees.map((v, i) => {
    return {
      degree: v,
      func: predictionModel.polynomialRegressionFunction(data, v),
      data: data,
      fittedData: null,
      fittingDegree: null,
    };
  });
  //调用评价模型，对各个预测方法生成的拟合数据进行评分
  predictionModelList.forEach((v, i) => {
    v.fittedData = v.data.map((value, i) => {
      return { x: value.x, y: v.func(value.x) };
    });
    v.fittingDegree = evaluationModel.fittingDegree(
      v.data,
      v.fittedData,
      v.degree
    );
  });

  //选出最好的模型
  const bestPredictionModel = predictionModelList.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree
      ? model
      : predictionModelList[i];
  });
  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

module.exports = { bestFittingModel };
