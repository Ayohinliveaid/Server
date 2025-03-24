const SVM = require("libsvm-js/asm");

// 准备训练数据
const X = [
  [1], // 特征 1
  [2], // 特征 2
  [3], // 特征 3
  [4], // 特征 4
  [5], // 特征 5
];
const y = [1, 2, 3, 4, 5]; // 对应的标签

const svm = new SVM({
  type: SVM.SVM_TYPES.EPSILON_SVR, // 设定为回归模式
  kernel: SVM.KERNEL_TYPES.LINEAR, // 选择 RBF 核
  cost: 1.0, // C 值，控制正则化
  epsilon: 0, // 误差范围
});

svm.train(X, y);

// 训练完成后进行预测
const prediction = svm.predict([[9]]);
console.log("预测值:", prediction); // 输出预测值
