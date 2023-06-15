const Joi = require("joi");
const mongoose = require("mongoose");
const { User } = require("./User");

let bookingSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        unique: true
    },
    bookings:[{
        type: Object,
        
    }],

   
})

let Booking=mongoose.model('booking',bookingSchema)


module.exports.Booking=Booking