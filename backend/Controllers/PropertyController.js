const Property = require("../Models/PropertyModel");
const bcrypt = require("bcrypt");
const insertProperty = async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error inserting Property",
        error: err.message,
      });
  }
};

const updateProperty = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  try {
    const result = await Property.updateOne(
      { _id: id },
      { $set: updatedata.oldData }
    );
    if (!result) {
      res.status(404).json({ success: false, message: "Property not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "error in updating the Property",
        error: err.message,
      });
  }
};

const getAllProperty = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search;

    const query = {
      deleted_at: null,
    };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const result = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Property.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error inserting Property" });
  }
};
const getSingleProperty = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Property.findOne({ _id: id });
    if (!result) {
      res.status(404).json({ success: false, message: "Property not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Property" });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Property.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Property" });
  }
};
module.exports = {
  insertProperty,
  updateProperty,
  getAllProperty,
  getSingleProperty,
  deleteProperty,
};
