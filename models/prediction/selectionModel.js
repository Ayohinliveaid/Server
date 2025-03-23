// 输入原数据，测试预测模型中所有的预测方法，生成对原数据的拟合数据，再调用评价模型对各拟合方法进行打分，返回得分最高的模型。

const predictionModel = require("./predictionModel");
const evaluationModel = require("./evaluationModel");

//首先调用测试模型中所有预测方法，生成相应的拟合数据，具体来说，是多项式回归的方法中，使用不同的方法作为项数
const degrees = [...Array(20)].map((v, i) => i + 1);

//预测方法对象，包括预测函数，原数据，生成的拟合数据，生成一个预测方法对象的数组，来保存

//调用评价模型，对各个预测方法生成的拟合数据进行评分，

const autoSelectedFunction = (data) => {};

module.exports = { autoSelectedFunction };
