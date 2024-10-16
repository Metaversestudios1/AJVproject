const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property", // Reference to the Property model
      required: true,
    },
    siteNumber: {
      type: String,
      required: true, // Site number for differentiation
    },
    status: {
      type: String,
      enum: ["Booked", "Available"], // Enum for site booking status
      default: "Available",
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Reference to the Agent model
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client", // Reference to the Client model
    },
    propertyDetails: {
      totalValue: {
        type: mongoose.Types.Decimal128, // Decimal valu e for the total site value
      },
      amountPaid: {
        type: mongoose.Types.Decimal128, // Decimal value for amount paid by the client
      },
      balanceRemaining: {
        type: mongoose.Types.Decimal128, // Decimal value for the balance remaining
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
      propertyDescription: {
        type: String,
      },
      saleAmount: {
        type: mongoose.Types.Decimal128,
      },
      witnesses: {
        type: [String], // Array of witness names
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
