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
  bookedProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property', // Assuming 'Property' is another model you have defined
    },
  ],
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate email addresses
  },
  address: {
    type: String,
    required: false,
  },
  preferredPropertyType: {
    type: String,
    required: false,
  },
  budget: {
    type: mongoose.Types.Decimal128, // Use Decimal128 for budget
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically sets the updatedAt field to the current date/time
  },
} ,{ timestamps: true, collection: "client" });

module.exports= mongoose.model("Client",clientSchema);