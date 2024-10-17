const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property", // Reference to the Property model
     },
    siteNumber: {
      type:String
    },
    status: {
      type: String,
      enum: ["Booked", "Available"], // Enum for site booking status
    },
    agentId: {
      type:String
    },
    description:{
      type: String,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client", // Reference to the Client model
    },
    propertyDetails: {
      totalValue: {
        type:Number, // Decimal valu e for the total site value
      },
      amountPaid: {
        type: Number, // Decimal value for amount paid by the client
      },
      balanceRemaining: {
        type:Number, // Decimal value for the balance remaining
      },
    },
    saleDeedDetails: {
      deedNumber: {
        type: String,
      },
      executionDate: {
        type: Date,
      },
      buyer: {
        type: String,
      },
      seller: {
        type: String,
      },
     
      saleAmount: {
        type: Number,
      },
      witnesses: {
        type: String, // Array of witness names
      },
      registrationDate: {
        type: Date,
        default: null, // Nullable for registration date
      },
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set to current date
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically set to current date
    },
  },
  { timestamps: true, collection: "site" }
);

module.exports = mongoose.model("Site", siteSchema);
