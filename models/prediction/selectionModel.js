// 输入原数据，测试预测模型中所有的预测方法，生成对原数据的拟合数据，再调用评价模型对各拟合方法进行打分，返回得分最高的模型。

const predictionModel = require("./predictionModel");
const evaluationModel = require("./evaluationModel");
const dataProcessingModel = require("../dataProcessingModel");
const { json } = require("express");

//调用评价模型，对各个预测方法生成的拟合数据进行评分，

//optimizedPolynomialRegressionModel表示多项式回归最佳模型
const optimizedPolynomialRegressionModel = (data) => {
  //首先调用测试模型中所有预测方法，生成相应的拟合数据，具体来说，是多项式回归的方法中，使用不同的方法作为项数
  const degrees = [...Array(4)].map((v, i) => i + 1); //多项式回归，项数的范围

  //预测方法对象，包括多项式项数，具体的预测函数，原数据，生成的拟合数据，获得的分数，生成一个预测方法对象的数组，来保存
  const predictionModelList = degrees.map((v, i) => {
    return {
      degree: v,
      func: predictionModel.polynomialRegressionFunction(data, v),
      n: dataProcessingModel.getPredictedX(data), //n表示要被预测的值，根据data获得
      data: data,
      fittedData: null,
      fittingDegree: null,
    };
  });
  //调用评价模型，对各个预测方法生成的拟合数据进行评分
  predictionModelList.forEach((v, i) => {
    v.fittedData = v.data.map((value, i) => {
      return { x: value.x, y: v.func(v.data.map((v) => v.x))[i] };
    });
    v.fittingDegree = evaluationModel.fittingDegree(
      v.data,
      v.fittedData,
      v.degree
    );
  });

  //选出最好的模型，目前仅仅从多项式回归选择，也就是仅仅选择多项式项数
  const bestPredictionModel = predictionModelList.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree
      ? model
      : predictionModelList[i];
  });
  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

//自动选择时间序列预测ARIMA的参数，包括pdq，返回最佳模型
const optimizedARIMAModel = (data) => {
  //p,d,q的范围，生成参数列表
  const pRange = [1, 2, 3, 4];
  const dRange = [0, 1, 3];
  const qRange = [1, 2, 3, 4];
  let paramList = [];
  for (let i = 0; i < pRange.length; i++) {
    for (let j = 0; j < dRange.length; j++) {
      for (let k = 0; k < qRange.length; k++) {
        paramList.push({ p: pRange[i], d: dRange[j], q: qRange[k] });
      }
    }
  }
  console.log("paramList", paramList);

  let passedNumber = 10; //训练数据中前几个不拟合的数据的数量

  // 生成一个ARIMA模型对象的队列，分别评估每一个，返回最好的那一个
  //预测方法对象，包括多项式项数，具体的预测函数，原数据，生成的拟合数据，获得的分数，生成一个预测方法对象的数组，来保存
  //输入的数据都是xy对象数组
  const ARIMAModelList = paramList.map((v, i) => {
    return {
      params: v,
      func: predictionModel.ARIMAFunction(data, v.p, v.d, v.q).func,
      n: dataProcessingModel.getPredictedX(data, 1), //n表示要被预测的值，根据data获得，第二个参数是时间序列预测特有，表示返回数量而不是数组
      model: predictionModel.ARIMAFunction(data, v.p, v.d, v.q).model,
      data: data,
      fittedData: [],
      fittingDegree: null,
    };
  });
  //生成拟合数据和拟合度指标，每一个模型，通过部分输入训练数据，预测下一个没有输入的训练数据，并将训练数据逐个增加，进而实现对训练数据的拟合
  ARIMAModelList.forEach((v, i) => {
    v.data.sort((v1, v2) => v1.x - v2.x);
    //v表示每一个模型，也就是上面的对象
    v.data.forEach((value, i) => {
      if (i < passedNumber) return; //前几个不预测
      v.model.fit(v.data.slice(0, i).map((v) => v.y));
      v.fittedData.push({
        x: v.data[i].x,
        y: Number(v.model.predict(1)[0][0]),
      });
    });

    v.fittingDegree = evaluationModel.fittingDegree(
      v.data.slice(passedNumber, v.data.length),
      v.fittedData,
      v.params.p + v.params.d + v.params.q //通过求和的方式确定参数的复杂程度，也可以改进为加权
    );
    // console.log("fittingDegree", v.fittingDegree);

    //最后训练总数据，和前面的子数据叠加，进一步优化参数
    v.model.fit(v.data.map((value) => value.y));
  });

  //选出最好的模型，目前仅仅从ARIMA回归选择，也就是仅仅选择p,d,q
  const bestPredictionModel = ARIMAModelList.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree ? model : ARIMAModelList[i];
  }, ARIMAModelList[0]);

  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

//综合多项式回归选择最佳预测模型，输入数据，调用最佳参数的对应模型

const optimizedModel = async (data) => {
  //Ljung-box测试计算自相关性
  let isAutocorelated = dataProcessingModel.ljungBoxTest(
    data,
    Math.floor(data.length / 4)
  );
  let model;
  if (isAutocorelated) {
    console.log("自相关性强，使用ARIMA模型");
    model = optimizedARIMAModel(data);
    model.answer = "自相关性强，使用ARIMA模型";
  } else {
    let islinear = dataProcessingModel.pearsonCorrelation(data);
    if (islinear) {
      console.log("线性强，使用多项式回归模型");
      model = optimizedPolynomialRegressionModel(data);
      model.answer = "线性强，使用多项式回归模型";
    } else {
      if (data.length < 500) {
        // console.log("哈哈，进入了data.length < 500的分支");
        console.log("数据少而非线性，使用支持向量回归模型");
        console.log("data", data);
        model = {
          // params: v,
          func: predictionModel.SVMRegression(data).func,
          n: dataProcessingModel.getPredictedX(data), //n表示要被预测的值，根据data获得
          // data: data,
          // fittedData: [],
          // fittingDegree: null,
          answer: "数据少而非线性，使用支持向量回归模型",
        };
      } else {
        console.log("数据多而非线性，使用神经网络回归模型");
        model = {
          // params: v,
          func: await predictionModel.BPNetworkFunction(data),
          n: dataProcessingModel.getPredictedX(data), //n表示要被预测的值，根据data获得
          data: data,
          // fittedData: [],
          // fittingDegree: null,
          answer: "数据多而非线性，使用神经网络回归模型",
        };
      }
    }
  }
  return model;
};

// const data = [
//   { x: 1, y: 105 },
//   { x: 2, y: 107 },
//   { x: 3, y: 110 },
//   { x: 4, y: 108 },
//   { x: 5, y: 115 },
//   { x: 6, y: 120 },
//   { x: 7, y: 118 },
//   { x: 8, y: 125 },
//   { x: 9, y: 130 },
// ];
// optimizedModel(data, 1); // 示例数据

module.exports = {
  optimizedPolynomialRegressionModel,
  optimizedARIMAModel,
  optimizedModel,
};
