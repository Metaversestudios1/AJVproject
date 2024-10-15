const mongoose =require('mongoose')

const AdminSchema = new mongoose.Schema({
    email:{
        type:String,
    },
    password:{
        type:String
    },
    contact: { type: String },
    status:{
        type:Number,
        default:1,
    },
} ,{ timestamps: true, collection: "admin" });

module.exports= mongoose.model("Admin",AdminSchema);