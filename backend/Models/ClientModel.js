const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  clientname: {
    type: String,   
  },
  contactNumber: {
    type: String,
  },
  client_id:{
    type: String,
  },
  bookedProperties: 
    {
      type: String,
     },
  email: {
    type: String,
    unique: true, // Ensures no duplicate email addresses
  },
  address: {
    type: String,
   
  },
  preferredPropertyType: {
    type: String,
 
  },
  budget: {
    type: String, // Use Decimal128 for budget
    default: null,
  },
  notes: {
    type: String,
  },
  panNumber: {
    type: String,
   },
  dateOfBirth: {
    type: Date,
   },
  gender: {
    type: String,
    },
  occupation: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically sets the updatedAt field to the current date/time
  },
  deleted_at: {
      type: Date,
      default: null,
    },
} ,{ timestamps: true, collection: "client" });

module.exports= mongoose.model("Client",clientSchema);