const Property = require("../Models/PropertyModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const path = require('path');


dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImage = (buffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    if (!mimetype || typeof mimetype !== "string") {
      return reject(new Error("MIME type is required and must be a string"));
    }

    if (!mimetype.startsWith("image")) {
      return reject(new Error("Only image files are supported"));
    }

    const fileNameWithoutExtension = path.basename(originalname);
    const publicId = `${fileNameWithoutExtension}`;
    const options = {
      resource_type: "image", // Only images are allowed
      public_id: publicId,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    const dataURI = `data:${mimetype};base64,${buffer.toString("base64")}`;

    cloudinary.uploader.upload(
      dataURI,
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return reject(
            new Error(`Cloudinary upload failed: ${error.message}`)
          );
        }
        resolve(result);
      }
    );
  });
};

const insertProperty = async (req, res) => {
  if (req.file) {
    console.log("req.file is present");
    const { originalname, buffer, mimetype } = req.file;
    if (!mimetype || typeof mimetype !== 'string') {
      console.error("Invalid MIME type:", mimetype);
      return res.status(400).json({ success: false, message: "Invalid MIME type" });
    }

    try {
      const pData = req.body;
      // Upload file to Cloudinary
      const uploadResult = await uploadImage(buffer, originalname,mimetype);
      if (!uploadResult) {
        return res.status(500).json({ success: false, message: "File upload error" });
      }
    
      // Create new Property with file information
      const newProperty = new Property({
        ...pData,
        photo: {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          originalname: originalname,
          mimetype: req.file.mimetype,
        },
      });

      await newProperty.save();
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error inserting Property:", error.message);
      res.status(500).json({
        success: false,
        message: "Error inserting Property",
        error: error.message,
      });
    }
  } else {
    console.log("req.file is not present");
    try {
      const PropertyData = req.body;

      // Create new Property without file information
      const newProperty = new Property({
        ...PropertyData,
      });

      await newProperty.save();
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error inserting Property without file:", error.message);
      res.status(500).json({
        success: false,
        message: "Error inserting Property",
        error: error.message,
      });
    }
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
      query.$or = [
        { propertyname: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const result = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Property.find(query).countDocuments();

    res.status(200).json({ success: true, result, count });
  } catch (error) {
    console.error("Error fetching properties:", error);  // Log the actual error
    res.status(500).json({ success: false, message: "error fetching Property", error: error.message });
  }
};
const getSingleProperty = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Property.findOne({ _id: id });
    if (!result) {
      return res.status(404).json({ success: false, message: "Property not found" });
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
const getsinglePropertyID = async(req,res) => {
  const { id } = req.query; // Destructure id and transactionType from req.query
  try {
      const query = { _id: id }; // Build the query with _id
  
    
      const result = await Property.find(query); // Query the database
      if (!result || result.length === 0) {
          return res.status(404).json({ message: "No property found" });
      }
  
      res.status(201).json({ success: true, result });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
  }
  
}
module.exports = {
  insertProperty,
  updateProperty,
  getAllProperty,
  getSingleProperty,
  deleteProperty,
  getsinglePropertyID
};
