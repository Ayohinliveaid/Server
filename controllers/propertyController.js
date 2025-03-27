const propertyModel = require("../models/propertyModel");
const getCats = async (req, res) => {
  try {
    const properties = await propertyModel.requestCatAPI();
    // const properties = await propertyModel.requestRealtorAPI();
    return res.status(200).json({ properties });
  } catch (error) {
    return res.status(400).json({ err: error.message });
  }
};

const getData = async (req, res) => {
  try {
    const data = await propertyModel.requestRealtorAPI();
    // const newData = data.properties.map((v, i) => {
    //   return {
    //     j: v.location.address.coordinate.lon,
    //     w: v.location.address.coordinate.lat,
    //     t: v.list_price,
    //   };
    // });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({ err: err.massage });
  }
};

module.exports = { getCats, getData };
