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
    type: String,  
  },
 
  commissions: [
    {
      siteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site', // Reference to the Site model
      },
      PaidAmount: {
        type: Number,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
