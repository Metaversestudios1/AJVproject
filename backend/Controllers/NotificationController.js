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
  try {
    const { id } = req.body; // Assume the notificationId is passed as a URL parameter
    const pData = req.body;
    let photos = []; // Array to store new image information

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      console.log("req.files is present");

      // Loop through each file and upload it to Cloudinary (or another service)
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
    }
console.log(id);
    // Find the existing notification
    const existingNotification = await Notification.findOne({ _id: id });
console.log(existingNotification);
    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // If new images are uploaded, add them to the existing images in the database
    const updatedPhotos = existingNotification.photos.concat(photos);

    // Update the notification, keeping existing images and adding new ones
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: id }, // Find notification by ID
      { 
        ...pData, // Other fields in the body will be updated
        photos: updatedPhotos, // Add new images while keeping old ones
      },
      { new: true } // 'new' returns the modified document
    );

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: error.message,
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

const deleteNotificationPhoto = async(req,res) =>{
  const { notificationId, photoIndex } = req.body;

  try {
    // Find the property by ID
    const notification = await Notification.findById(notificationId);
    console.log(notification);
    if (!notification) {
      return res.status(404).json({ message: 'notification not found' });
    }

    // Check if photoIndex is valid
    if (photoIndex < 0 || photoIndex >= notification.photos.length) {
      return res.status(400).json({ message: 'Invalid photo index' });
    }

    // Get the public ID of the photo to delete from Cloudinary
    const photoPublicId = notification.photos[photoIndex].publicId; // Ensure your photo object has a public_id field
    // Delete the photo from Cloudinary
    await cloudinary.uploader.destroy(photoPublicId, (error, result) => {
      if (error) {
        console.error('Cloudinary error:', error);
        return res.status(500).json({ message: 'Failed to delete photo from Cloudinary' });
      }
      console.log('Cloudinary result:', result);
    });

    // Remove the photo from the array
    notification.photos.splice(photoIndex, 1);

    // Save the updated property
    await notification.save();

    res.status(200).json({ success:true,message: 'Photo deleted successfully', photos: notification.photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false, message: 'Server error' });
  }
}
module.exports = {
  insertNotification,
  updateNotification,
  getAllNotification,
  getSingleNotification,
  deleteNotification,
  deleteNotificationPhoto
};
