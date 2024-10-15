const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    propertyname: {
        type: String,    
    },
    status: {
        type: String,
        enum: ['Booked', 'Available'], // Enum for property status
        required: true,
    },
    description: {
        type: String,
        default: null, // Optional field for property description
    },
    address: {
        type: String,
    },
    sites: {
        type: Number,
    },
    
    updatedAt: {
        type: Date,
        default: Date.now, 
      }// Automatically set to the current date
    } ,{ timestamps: true, collection: "property" });
    
    module.exports= mongoose.model("Property",propertySchema);
    