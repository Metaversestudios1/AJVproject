const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
   photos: [
      {
        publicId: { type: String },
        url: { type: String },
        originalname: { type: String },
        mimetype: { type: String },
      },
    ], // Commission rate associated with this rank
    description: { type: String }, // Optional description for the rank
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically sets the updatedAt field to the current date/time
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: "notification" }
);

module.exports = mongoose.model("Notification", NotificationSchema);
