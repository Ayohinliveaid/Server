const tf = require("@tensorflow/tfjs");

/**
 * 使用 BP 神经网络（反向传播）进行拟合
 * @param {Array} data - 包含 {x, y} 结构的对象数组
 * @param {number} epochs - 训练的轮数
 * @param {number} hiddenUnits - 隐藏层神经元数量
 * @returns {Object} - 训练好的 TensorFlow.js 模型
 */

async function trainBPNetwork(data, epochs = 100, hiddenUnits = 10) {
  if (!data || data.length === 0) {
    throw new Error("数据为空");
  }

  // 提取 x 和 y
  const xs = data.map((d) => d.x); // x 是数组，例如 [1, 2, 3]
  const ys = data.map((d) => d.y); // y 是标量，例如 100.5

  // 将数据转换为 Tensor
  const inputTensor = tf.tensor2d(xs, [xs.length, xs[0].length]); // x 可能是多维的
  const outputTensor = tf.tensor2d(ys, [ys.length, 1]); // y 只有 1 维

  // 归一化数据（Min-Max 归一化）
  const inputMax = inputTensor.max();
  const inputMin = inputTensor.min();
  const outputMax = outputTensor.max();
  const outputMin = outputTensor.min();

  const normalizedInputs = inputTensor
    .sub(inputMin)
    .div(inputMax.sub(inputMin));
  const normalizedOutputs = outputTensor
    .sub(outputMin)
    .div(outputMax.sub(outputMin));

  // 创建 BP 神经网络模型
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [xs[0].length],
      units: hiddenUnits,
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: hiddenUnits, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" })); // 线性回归任务，使用 linear 激活

  // 编译模型
  model.compile({
    optimizer: tf.train.adam(),
    loss: "meanSquaredError",
  });

  // 训练模型
  console.log("开始训练...");
  await model.fit(normalizedInputs, normalizedOutputs, {
    epochs: epochs,
    batchSize: 8,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss}`);
      },
    },
  });

  console.log("训练完成");

  // 预测函数（反归一化）
  function predict(inputArray) {
    const inputTensor = tf.tensor2d(inputArray, [
      inputArray.length,
      inputArray[0].length,
    ]);
    const normalizedInput = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin));
    const normalizedPrediction = model.predict(normalizedInput);
    const prediction = normalizedPrediction
      .mul(outputMax.sub(outputMin))
      .add(outputMin);
    return prediction.arraySync();
  }

  return { model, predict };
}

// 示例数据
const sampleData = [
  { x: [1, 2], y: 5 },
  { x: [2, 3], y: 8 },
  { x: [3, 4], y: 11 },
  { x: [4, 5], y: 14 },
];

// 训练 BP 神经网络
trainBPNetwork(sampleData, 200, 16).then(({ model, predict }) => {
  console.log("训练完成，开始预测...");
  const result = predict([
    [5, 6],
    [6, 7],
  ]);
  console.log("预测结果:", result);
});
