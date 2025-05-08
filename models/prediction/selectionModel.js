// 输入原数据，测试预测模型中所有的预测方法，生成对原数据的拟合数据，再调用评价模型对各拟合方法进行打分，返回得分最高的模型。

const predictionModel = require("./predictionModel");
const evaluationModel = require("./evaluationModel");
const dataProcessingModel = require("../dataProcessingModel");
const { json } = require("express");
const SVM = require("libsvm-js/out/asm/libsvm");

//调用评价模型，对各个预测方法生成的拟合数据进行评分，

//多项式回归最佳模型------------------------------------------------------------------------------------------------------------------------------
const optimizedPolynomialRegressionModel = (data) => {
  //首先调用测试模型中所有预测方法，生成相应的拟合数据，具体来说，是多项式回归的方法中，使用不同的方法作为项数
  const degrees = [...Array(5)].map((v, i) => i + 1); //多项式回归，项数的范围

  //预测方法对象，包括多项式项数，具体的预测函数，原数据，生成的拟合数据，获得的分数，生成一个预测方法对象的数组，来保存
  const predictionModelList = degrees.map((v, i) => {
    return {
      params: v,
      func: predictionModel.polynomialRegressionFunction(data, v),
      n: dataProcessingModel.getPredictedX(data), //n表示要被预测的值，根据data获得
      data: data,
      fittedData: null,
      fittingDegree: null,
    };
  });
  //调用评价模型，对各个预测方法生成的拟合数据进行评分
  predictionModelList.forEach((v, i) => {
    v.fittedData = v.data.map((value, index) => {
      return { x: value.x, y: v.func(v.data.map((v) => v.x))[index] };
    });
    // v.fittedData = v.func(v.data.map((v) => v.x));
    v.fittingDegree = evaluationModel.fittingDegree(
      v.data,
      v.fittedData,
      v.params
    );
  });

  //选出最好的模型，目前仅仅从多项式回归选择，也就是仅仅选择多项式项数
  const validModels = predictionModelList.filter(
    (m) => !isNaN(m.fittingDegree)
  );
  const bestPredictionModel = validModels.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree ? model : validModels[i];
  });
  console.log("optimizedPolynomialRegressionModel", bestPredictionModel);
  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

//自动选择时间序列预测ARIMA的参数，包括pdq，返回最佳模型--------------------------------------------------------------------------------
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
      n: dataProcessingModel.getPredictedX(data, "arima"), //n表示要被预测的值，根据data获得
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
  let initialModel;
  for (let i = 0; i < ARIMAModelList.length; i++) {
    if (ARIMAModelList[i]) {
      initialModel = ARIMAModelList[i];
    }
  }
  const bestPredictionModel = ARIMAModelList.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree ? model : ARIMAModelList[i];
  });
  console.log("bestPredictionModel", bestPredictionModel);

  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

//SVM回归选择最佳参数------------------------------------------------------------------------------------------------------------------------------
const optimizedSVMModel = (data) => {
  //cost,epsilon,gamma的范围，生成参数列表
  const costRange = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000];
  const epsilonRange = [0.00001, 0.0001, 0.001, 0.01, 0.1, 0.2, 0.5];
  const gammaRange = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000];
  let paramList = [];
  for (let i = 0; i < costRange.length; i++) {
    for (let j = 0; j < epsilonRange.length; j++) {
      for (let k = 0; k < gammaRange.length; k++) {
        paramList.push({
          cost: costRange[i],
          epsilon: epsilonRange[j],
          gamma: gammaRange[k],
        });
      }
    }
  }

  //预测方法对象，包括多项式项数，具体的预测函数，原数据，生成的拟合数据，获得的分数，生成一个预测方法对象的数组，来保存
  const SVMModelList = paramList.map((v, i) => {
    const SVMRegression = predictionModel.SVMRegression(
      data,
      v.cost,
      v.epsilon,
      v.gamma
    );
    return {
      params: v,
      // SVMRegression: SVMRegression,
      func: SVMRegression.func,
      free: SVMRegression.free, //svmModel特有，需要手动释放
      n: dataProcessingModel.getPredictedX(data, "svm"), //n表示要被预测的值，根据data获得
      data: data,
      fittedData: null,
      fittingDegree: null,
    };
  });

  SVMModelList.forEach((v, i) => {
    v.fittedData = v.data.map((value, i) => {
      return { x: value.x, y: v.func(v.data.map((v) => v.x))[i] };
    });
    v.fittingDegree = evaluationModel.fittingDegree(v.data, v.fittedData, 3);
    // v.free();
  });
  //选出最好的模型，目前仅仅从多项式回归选择，也就是仅仅选择多项式项数
  const bestPredictionModel = SVMModelList.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree ? model : SVMModelList[i];
  });
  //除了最优模型，其他全部释放
  SVMModelList.forEach((v, i) => {
    if (v != bestPredictionModel) {
      v.free();
    }
    console.log(v.fittingDegree);
  });
  console.log("bestPredictionModel", bestPredictionModel);
  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

//最佳BP神经网络模型------------------------------------------------------------------------------------------------------------------------------
const optimizedBPNetworkModel = async (data, res) => {
  //首先返回响应头
  if (res) {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
  }

  //生成参数列表
  const unitRange = [200];
  const activationRange = ["relu", "tanh"];
  const batchSizeRange = [8];
  const epochRange = [800];
  let paramList = [];
  for (let i = 0; i < unitRange.length; i++) {
    for (let j = 0; j < activationRange.length; j++) {
      for (let k = 0; k < batchSizeRange.length; k++) {
        for (let l = 0; l < epochRange.length; l++) {
          paramList.push({
            unit: unitRange[i],
            activation: activationRange[j],
            batchSize: batchSizeRange[k],
            epoch: epochRange[l],
          });
        }
      }
    }
  }
  console.log("paramList", paramList);
  let i = 0;

  //预测方法对象，包括多项式项数，具体的预测函数，原数据，生成的拟合数据，获得的分数，生成一个预测方法对象的数组，来保存
  const BPNetworkModelList = await Promise.all(
    paramList.map(async (v) => {
      //显示当前进度
      console.log("正在生成模型");
      const func = await predictionModel.BPNetworkFunction(
        data,
        v.unit,
        v.activation,
        v.batchSize,
        v.epoch
      );

      const n = dataProcessingModel.getPredictedX(data);
      const inputX = data.map((d) => d.x);
      const predictedY = await func(inputX); // func 是异步预测函数

      const fittedData = data.map((point, i) => ({
        x: point.x,
        y: predictedY[i],
      }));

      const complexity =
        v.unit + Math.ceil(data.length / v.batchSize) + v.epoch;

      const fittingDegree = evaluationModel.fittingDegree(
        data,
        fittedData,
        complexity
      );

      //显示当前进度
      i++;
      console.log("已生成" + i + "个模型");
      if (res) {
        res.write(JSON.stringify({ answer: "已生成" + i + "个模型" }) + "\n");
      }

      return {
        params: v,
        func,
        n,
        data,
        fittedData,
        fittingDegree,
      };
    })
  );

  console.log("正在选择最优模型");

  //选出最好的模型，目前仅仅从多项式回归选择，也就是仅仅选择多项式项数
  const bestPredictionModel = BPNetworkModelList.reduce((model, v, i) => {
    return model.fittingDegree > v.fittingDegree
      ? model
      : BPNetworkModelList[i];
  });
  console.log("optimizedBPNetworkModel", bestPredictionModel);
  return bestPredictionModel; //此处返回预测模型，便于查看选择结果
};

const optimizedModel = async (data) => {
  ////自动选择模型
  let isAutocorelated = dataProcessingModel.ljungBoxTest(
    data,
    Math.floor(data.length / 4)
  );
  let model;
  if (isAutocorelated) {
    model = optimizedARIMAModel(data);
    model.answer =
      "自相关性强，使用ARIMA模型" + "\n" + JSON.stringify(model.params);
  } else {
    let islinear = dataProcessingModel.pearsonCorrelation(data);
    if (islinear) {
      model = optimizedPolynomialRegressionModel(data);
      model.answer =
        "线性强，使用多项式回归模型" + "\n" + JSON.stringify(model.params);
    } else {
      if (data.length < 500) {
        model = optimizedSVMModel(data);
        model.answer =
          "数据少而非线性，使用支持向量回归模型" +
          "\n" +
          JSON.stringify(model.params);
      } else {
        model = await optimizedBPNetworkModel(data);
        model.answer =
          "数据多而非线性，使用神经网络回归模型" +
          "\n" +
          JSON.stringify(model.params);

        console.log("selectionModel中：", model);
      }
    }
  }

  // //手动使用ARIMA模型
  // model = optimizedARIMAModel(data);
  // model.answer =
  //   "手动使用ARIMA模型" +
  //   "\n" +
  //   JSON.stringify(model.params) +
  //   "\n" +
  //   JSON.stringify(model.fittingDegree);
  //// 手动使用多项式回归模型
  // model = optimizedPolynomialRegressionModel(data);
  // model.answer =
  //   "手动使用多项式回归模型" +
  //   "\n" +
  //   JSON.stringify(model.params) +
  //   "\n" +
  //   JSON.stringify(model.fittingDegree);
  // //手动使用支持向量回归模型
  // model = optimizedSVMModel(data);
  // model.answer =
  //   "手动使用支持向量回归模型" +
  //   "\n" +
  //   JSON.stringify(model.params) +
  //   "\n" +
  //   JSON.stringify(model.fittingDegree);
  // //手动使用神经网络回归模型
  // model = await optimizedBPNetworkModel(data);
  // model.answer =
  //   "手动使用神经网络回归模型" +
  //   "\n" +
  //   JSON.stringify(model.params) +
  //   "\n" +
  //   JSON.stringify(model.fittingDegree);
  return model;
};

module.exports = {
  optimizedPolynomialRegressionModel,
  optimizedARIMAModel,
  optimizedSVMModel,
  optimizedBPNetworkModel,
  optimizedModel,
};
