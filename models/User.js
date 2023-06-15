const { clearCache } = require("ejs");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

let userSchema=new mongoose.Schema({
    username:{
        type: String,
        unique: true,
        minLength:4,
        required: true
    },
    password:{
        type:String,
        required: true

    }
})
userSchema.methods.genToken=function(){
    
    const token=jwt.sign({id:this._id,username:this.username,},"cash2me")
    return token;
}
let User=mongoose.model('User',userSchema)

const UserValidator=Joi.object({
    username:Joi.string().min(5).required(),
    password:Joi.string().min(5).required(),
})

module.exports.User=User
module.exports.UserValidator=UserValidator