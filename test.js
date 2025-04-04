import AIModel from "./models/AIModel.js";
// const propertyModel = require("./models/propertyModel");
import propertyModel from "./models/propertyModel.js";
import predictionModel from "./models/prediction/predictionModel.js";
import dataProcessingModel from "./models/dataProcessingModel.js";

// //测试抽象对象的数据结构，以提问AI选择参数
// const testObj = {
//   name: "Estima",
//   address: {
//     street: "123 Main St",
//     city: "Cityville",
//     coordinates: [
//       { lat: 40.7128, lon: -74.006 },
//       { lat: 34.0522, lon: -118.2437 },
//     ],
//   },
//   tags: ["real estate", "prediction", "AI"],
//   properties: [
//     { type: "apartment", price: 500000 },
//     { type: "house", price: 750000 },
//   ],
//   relatedData: [
//     { id: 1, value: "Data A" },
//     { id: 2, value: "Data B" },
//   ],
// };
// const keys = dataProcessingModel.getKeys(testObj);

// console.log(keys);

// //测试dimension的函数

// const text = "休斯顿市的出租的商品房的坐标";
// const data = await propertyModel.requestLocalJSON();
// const properties = data.properties;
// const list = dataProcessingModel.getKeys(data);
// console.log("list", list);
// const dimension = await AIModel.dimensionFromDS(list, text);
// const x = dataProcessingModel.getChildAndParent(dimension.x).child;
// const y = dataProcessingModel.getChildAndParent(dimension.y).child;
// const xParent = dataProcessingModel.getChildAndParent(dimension.x).parent;
// const yParent = dataProcessingModel.getChildAndParent(dimension.y).parent;
// console.log("dimension", dimension);
// console.log("x", x);
// console.log("y", y);
// console.log("xParent", xParent);
// console.log("yParent", yParent);

// // 调用PropertyModel对房产信息进行过滤;
// const mappedData = dataProcessingModel.mappedData(
//   properties,
//   x,
//   y,
//   null,
//   xParent,
//   yParent,
//   null
// );
// console.log("mappedData", mappedData);

// // 调用AI描述接口，对房产信息进行描述
// const description = await AIModel.descriptionFromDS(mappedData,text);
// console.log("description", description);

// //测试数据的参数转换
// const data = [
//   {
//     sqft: 1619,
//     list_price: 1795,
//   },
//   {
//     sqft: 1865,
//     list_price: 2050,
//   },
//   {
//     sqft: 1548,
//     list_price: 1750,
//   },
// ];
// const convertProps = dataProcessingModel.convertProps(data);
// const xyResult = convertProps.xy();

// console.log("xy", xyResult);
// console.log("origin", convertProps.origin(xyResult));

//测试皮尔逊相关系数
// //计算线性：皮尔逊相关系数
// const pearsonCorrelation = (x, y) => {
//   const n = x.length;

//   if (x.length !== y.length) {
//     throw new Error("Arrays must have the same length");
//   }

//   const meanX = x.reduce((a, b) => a + b, 0) / n;
//   const meanY = y.reduce((a, b) => a + b, 0) / n;

//   let numerator = 0;
//   let varianceX = 0;
//   let varianceY = 0;

//   for (let i = 0; i < n; i++) {
//     const dx = x[i] - meanX;
//     const dy = y[i] - meanY;
//     numerator += dx * dy;
//     varianceX += dx * dx;
//     varianceY += dy * dy;
//   }

//   const denominator = Math.sqrt(varianceX * varianceY);

//   return denominator === 0 ? 0 : numerator / denominator;
// };

// // 示例数据
// const sqft = [756, 816, 822, 840, 844, 856, 910, 960, 973, 980, 1004, 1008];
// const list_price = [
//   1127, 1200, 1295, 1500, 1400, 999, 1000, 1950, 1300, 1225, 1550, 1299,
// ];

// console.log("Pearson Correlation:", pearsonCorrelation(sqft, list_price));

// //计算自相关系数，延迟K阶的
// const autocorrelation = (series, lag) => {
//   const n = series.length;
//   if (lag >= n) {
//     throw new Error("Lag is too large for the dataset");
//   }

//   const mean = series.reduce((a, b) => a + b, 0) / n;

//   let numerator = 0;
//   for (let i = 0; i < n - lag; i++) {
//     numerator += (series[i] - mean) * (series[i + lag] - mean);
//   }

//   let denominator = 0;
//   for (let i = 0; i < n; i++) {
//     denominator += Math.pow(series[i] - mean, 2);
//   }

//   return denominator === 0 ? 0 : numerator / denominator;
// };

// //ljung-box检验
// const ljungBoxTest = (data, maxLag) => {
//   const n = data.length;
//   let Q = 0;

//   // 计算前maxLag个滞后期的自相关系数
//   for (let lag = 1; lag <= maxLag; lag++) {
//     const acf = autocorrelation(data, lag);
//     Q += (n * (n + 2) * Math.pow(acf, 2)) / (n - lag);
//   }

//   return Q;
// };

// // 示例数据
// const data = [
//   1127, 1200, 1295, 1500, 1400, 999, 1000, 1950, 1300, 1225, 1550, 1299,
// ];

// // 计算Ljung-Box统计量，假设我们计算前5个滞后期
// const maxLag = 5;
// const Q = ljungBoxTest(data, maxLag);
// console.log("Ljung-Box Statistics:", Q);

// //测试 chi-squared临界值
// import jStat from "jstat";

// // Function to get chi-squared critical value
// const getChiSquaredCriticalValue = (df, alpha) => {
//   return jStat.chisquare.inv(1 - alpha, df);
// };

// // Example: Chi-squared critical value for degrees of freedom = 5 and significance level = 0.05
// const df = 5; // Degrees of freedom
// const alpha = 0.05; // Significance level

// const criticalValue = getChiSquaredCriticalValue(df, alpha);
// console.log("criticalValue:", criticalValue);

// 测试预测的x的数组

const data = [
  { x: 1, y: 2 },
  { x: 2, y: 3 },
  { x: 3, y: 4 },
  { x: 5, y: 4 },
  { x: 4, y: 4 },
  { x: 6, y: 4 },
];

const getPredictedX = dataProcessingModel.getPredictedX(data);
console.log("getPredictedX", getPredictedX);
