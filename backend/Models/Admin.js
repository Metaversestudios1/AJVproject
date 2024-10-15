const mongoose = require('mongoose');

// Define the User Schema
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Agent'],
    required: true,
  },
  rank: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Rank model
    ref: 'Rank', // This should match the name of the Rank model
    default: null, // Nullable
  },
  commissionRate: {
    type: mongoose.Types.Decimal128, // For decimal values
    default: null, // Nullable
  },
  clients: {
    type: [String], // Array of Client IDs
    default: null, // Nullable
  },
  properties: {
    type: [String], // Array of Property IDs
    default: null, // Nullable
  },
  hierarchy: {
    type: [String], // Array of Agent IDs
    default: null, // Nullable
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
  updatedAt: {
    type: Date,
    default: Date.now, 
  }// Automatically set to the current date
} ,{ timestamps: true, collection: "admin" });

module.exports= mongoose.model("Admin",AdminSchema);
