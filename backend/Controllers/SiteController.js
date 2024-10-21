const PropertyModel = require("../Models/PropertyModel");
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
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const id = req.query.id;
    const filter = req.query.filter;

    // Build query to match sites
    const query = {
      deleted_at: null, // Ensure we only match non-deleted sites
    };
    let sortCondition = { createdAt: -1 };
    if (filter === 'recent') {
      sortCondition = { createdAt: -1 }; // Descending order (newest first)
    } else if (filter === 'oldest') {
      sortCondition = { createdAt: 1 };  // Ascending order (oldest first)
    } else if (filter === 'Available') {
      query.status = 'Available'; // Filter by status 1
    } else if (filter === 'Booked') {
      query.status = 'Booked'; // Filter by status 0
    } else if (filter === 'Completed') {
      query.status = 'Completed'; // Filter by status 0
    }
    console.log
    if (id) {
      query.propertyId = id;
    }
    // If search string is provided, we search within the related property name
    if (search) {
      const properties = await PropertyModel.find({
        propertyname: { $regex: search, $options: "i" },
      }).select("_id"); // Only select property IDs

      // If properties are found, use their IDs in the query
      if (properties.length > 0) {
        const propertyIds = properties.map(property => property._id);
        query.propertyId = { $in: propertyIds };
      } else {
        // If no matching properties found, return empty result
        return res.status(200).json({ success: true, result: [], count: 0 });
      }
    }

    // Perform the site query with pagination
    const result = await Site.find(query)
      .populate('propertyId', 'propertyname') // Populate the propertyname
      .sort(sortCondition)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const count = await Site.find(query).countDocuments();

    res.status(200).json({ success: true, result, count });
  } catch (error) {
    console.error("Error fetching Sites:", error);  // Log the actual error
    res.status(500).json({ success: false, message: `Error fetching Sites: ${error.message}` });
  }
};

const getSingleSite = async (req, res) => {
  console.log(req.body);
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
const updatesitestatus = async (req, res) => {
  try {
    console.log(res.body);
      const { id } = req.params
      const status = req.body.status;
      const Sitenew = await Site.findById(id);
      Sitenew.status = status;
      await Sitenew.save();
      res.status(200).json({ success: true });

  } catch (err) {
      res.status(500).json({ success: false, message: "error fetching transaction", error: err.message });

  }

}
module.exports = {
  insertSite,
  updateSite,
  getAllSite,
  getSingleSite,
  deleteSite,
  updatesitestatus
};
