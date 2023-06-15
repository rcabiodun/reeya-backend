const Joi = require("joi");
const mongoose = require("mongoose");
const { User } = require("./User");

let profileSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        unique: true
    },
    
   
    first_name:{
        type:String,
    },

    last_name:{
        type:String,
    },
    middle_name:{
        type:String,
    },
    email:{
        type:String,
    },
    phonenumber:{
        type:String,
    },
    role:{
        type: String,
        enum:["OWNER","WORKER"],
    },
    
    
})

let profile=mongoose.model('profile',profileSchema)

const profileValidator=Joi.object({
    first_name:Joi.string().min(5).required(),
    last_name:Joi.string().min(5).required(),
    middle_name:Joi.string().min(5).required(),
    role:Joi.string().min(5).required(),
    email:Joi.string().email().required(),
    phonenumber:Joi.string().max(11).required(),
    rate:Joi.string().max(350),
})

module.exports.Profile=profile
module.exports.profileValidator=profileValidator