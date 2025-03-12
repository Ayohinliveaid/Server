const propertyModel = require("../models/propertyModel")
const getProperty = async (req, res) => {
    try {
        const properties = await propertyModel.requestPropertyInfo();
        return res.status(200).json({ properties });

    } catch (error) {
        return res.status(400).json({ err: error.message });
    }
}

const getData = async (req, res) => {
    try {
        const data = await propertyModel.requestPropertyRates();
        return res.status(200).json({ data });

    } catch (err) {
        return res.status(400).json({ err: err.massage });
    }
}


module.exports = { getProperty, getData }




