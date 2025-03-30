import AIModel from "./models/AIModel.js";
// const propertyModel = require("./models/propertyModel");
import propertyModel from "./models/propertyModel.js";
import predictionModel from "./models/prediction/predictionModel.js";

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
// const keys = propertyModel.getKeys(testObj);

// console.log(keys);

// //测试dimension的函数

// const text = "休斯顿市的出租的商品房的坐标";
// const data = await propertyModel.requestLocalJSON();
// const properties = data.properties;
// const list = propertyModel.getKeys(data);
// console.log("list", list);
// const dimension = await AIModel.dimensionFromDS(list, text);
// const x = propertyModel.getChildAndParent(dimension.x).child;
// const y = propertyModel.getChildAndParent(dimension.y).child;
// const xParent = propertyModel.getChildAndParent(dimension.x).parent;
// const yParent = propertyModel.getChildAndParent(dimension.y).parent;
// console.log("dimension", dimension);
// console.log("x", x);
// console.log("y", y);
// console.log("xParent", xParent);
// console.log("yParent", yParent);

// // 调用PropertyModel对房产信息进行过滤;
// const mappedData = propertyModel.mappedData(
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

//测试数据的参数转换
const data = [
  {
    sqft: 1619,
    list_price: 1795,
  },
  {
    sqft: 1865,
    list_price: 2050,
  },
  {
    sqft: 1548,
    list_price: 1750,
  },
];
const convertProps = predictionModel.convertProps(data);
const xyResult = convertProps.xy();

console.log("xy", xyResult);
console.log("origin", convertProps.origin(xyResult));
