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
  
  clients: {
    type: [String], // Array of Client IDs
    default: null, // Nullable
  },
  properties: {
    type: [String], // Array of Property IDs
    default: null, // Nullable
  },
  superior: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent', // References another agent (the superior)
    default: null, // If null, this is the top agent
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
