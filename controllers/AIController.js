const AIModel = require("../models/AIModel");

const requestConfig = async (req, res) => {
  const { text } = req.body;
  AIModel.configFromDS(text)
    .then((config) => {
      return res.status(200).json(config);
    })
    .catch((error) => {
      return res.status(400).json({ err: error.message });
    });
};

const requestDescription = async (req, res) => {
  const { data } = req.body;
  AIModel.descriptionFromDS(data)
    .then((description) => {
      return res.status(200).json(description);
    })
    .catch((error) => {
      return res.status(400).json({ err: error.message });
    });
};

const requestDimension = async (req, res) => {
  const { list, question } = req.body;
  AIModel.dimensionFromDS(list, question)
    .then((dimension) => {
      return res.status(200).json(dimension);
    })
    .catch((error) => {
      return res.status(400).json({ err: error.message });
    });
};

module.exports = { requestConfig, requestDescription, requestDimension };
