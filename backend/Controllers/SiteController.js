const Site = require("../Models/SiteModel");
const bcrypt = require("bcrypt");
const insertSite = async (req, res) => {
  try {
    const newSite = new Site(req.body);
    await newSite.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error inserting Site",
        error: err.message,
      });
  }
};

const updateSite = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  try {
    const result = await Site.updateOne(
      { _id: id },
      { $set: updatedata.data }
    );
    if (!result) {
      res.status(404).json({ success: false, message: "Site not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "error in updating the Site",
        error: err.message,
      });
  }
};

const getAllSite = async (req, res) => {
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

    const result = await Site.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Site.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error inserting Site" });
  }
};
const getSingleSite = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Site.findOne({ _id: id });
    if (!result) {
      res.status(404).json({ success: false, message: "Site not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Site" });
  }
};

const deleteSite = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Site.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Site not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Site" });
  }
};
module.exports = {
  insertSite,
  updateSite,
  getAllSite,
  getSingleSite,
  deleteSite,
};
