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
    type: mongoose.Types.Decimal128, // Use Decimal128 for budget
    default: null,
  },
  notes: {
    type: String,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically sets the updatedAt field to the current date/time
  },
} ,{ timestamps: true, collection: "client" });

module.exports= mongoose.model("Client",clientSchema);