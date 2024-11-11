const Notification = require("../Models/NotificationModel");
const bcrypt = require("bcrypt");

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

const insertNotification = async (req, res) => {
  try {
    
  if (req.files && req.files.length > 0) {
    console.log("req.files is present");
    const photos = []; // Array to store the image information
    try {
      const pData = req.body;

      // Loop through each file and upload it to Cloudinary (or other service)
      for (const file of req.files) {
        const { originalname, buffer, mimetype } = file;
        if (!mimetype || typeof mimetype !== "string") {
          console.error("Invalid MIME type:", mimetype);
          return res.status(400).json({ success: false, message: "Invalid MIME type" });
        }

        // Upload file to Cloudinary (or your chosen service)
        const uploadResult = await uploadImage(buffer, originalname, mimetype);
        if (!uploadResult) {
          return res.status(500).json({ success: false, message: "File upload error" });
        }

        // Store each uploaded image's details in the photos array
        photos.push({
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          originalname: originalname,
          mimetype: mimetype,
        });
      }

      // Create new Property with multiple image information
      const newNotification = new Notification({
        ...pData,
        photos: photos, // Save all uploaded images
      });

      await newNotification.save();

    
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error inserting with multiple files:", error.message);
      res.status(500).json({
        success: false,
        message: "Error inserting notification",
        error: error.message,
      });
    }
  }

    res.status(201).json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error inserting Notification",
        error: err.message,
      });
  }
};

const updateNotification = async (req, res) => {
  const updatedata = req.body;
  const id = updatedata.id;
  try {
    const result = await Notification.updateOne(
      { _id: id },
      { $set: updatedata.oldData }
    );
    if (!result) {
      res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "error in updating the Notification",
        error: err.message,
      });
  }
};

const getAllNotification = async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const search = req.query.search;

    const query = {
      deleted_at: null,
    };
    if (search) {
      query.description = { $regex: search, $options: "i" };
    }

    const result = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Notification.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error inserting Notification" });
  }
};
const getSingleNotification = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await Notification.findOne({ _id: id });
    if (!result) {
      res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.status(201).json({ success: true, result: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Notification" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await Notification.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "error fetching Notification" });
  }
};
module.exports = {
  insertNotification,
  updateNotification,
  getAllNotification,
  getSingleNotification,
  deleteNotification,
};
