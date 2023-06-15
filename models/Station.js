const Joi = require("joi");
const mongoose = require("mongoose");
const { Profile } = require("./Profile");

let stationSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Profile,
        unique: true
    },

    title: {
        type: String,
        required:true
    },
    station_type: {
        type: String,
        enum: ["retailer", "wholesaler", "dispatch"],
        minLength: 4,
        required: true
    },

    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Profile,
    }],
   
    documents: [String],//proof of ownership of business

    is_verified: {
        //if the documents are valid
        type: Boolean,
        default: false
    },
    location:{
        type:String,
        required:true
    },
    wallet:{
        type:Number,
        default:0
    }

    
})

let station = mongoose.model('station', stationSchema)



module.exports.Station = station