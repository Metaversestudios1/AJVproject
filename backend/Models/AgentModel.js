const mongoose = require('mongoose');

// Define the User Schema
const AgentSchema = new mongoose.Schema({
  agentname: {
    type: String,
    
  },
  agent_id:{
    type: String,
  },
  password: {
    type: String,
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
  updatedAt: {
    type: Date,
    default: Date.now, 
  },// Automatically set to the current date
  deleted_at: {
      type: Date,
      default: null,
    },
} ,{ timestamps: true, collection: "Agent" });

module.exports= mongoose.model("Agent",AgentSchema);
