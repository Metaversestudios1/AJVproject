const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project', // Reference to the Project model
        required: true,
    },
    status: {
        type: String,
        enum: ['Booked', 'Available'], // Enum for property status
        required: true,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'client', // Reference to the Client model
        default: null, // Nullable
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Reference to the Agent model
        default: null, // Nullable
    },
    totalValue: {
        type: mongoose.Types.Decimal128, // For decimal values
        required: true,
    },
    amountPaid: {
        type: mongoose.Types.Decimal128, // For decimal values
        required: true,
    },
    balance: {
        type: mongoose.Types.Decimal128, // For decimal values
        required: true,
    },
    saleDeedDetails: {
        type: String,
        default: null, // Nullable
    },
    address: {
        street: {
            type: String,
            required: true, // Required field for street address
        },
        city: {
            type: String,
            required: true, // Required field for city
        },
        state: {
            type: String,
            required: true, // Required field for state
        },
        zipCode: {
            type: String,
            required: true, // Required field for zip code
        },
        country: {
            type: String,
            required: true, // Required field for country
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now, 
      }// Automatically set to the current date
    } ,{ timestamps: true, collection: "property" });
    
    module.exports= mongoose.model("Property",propertySchema);
    