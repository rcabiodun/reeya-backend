const Joi = require("joi");
const mongoose = require("mongoose");
const { User } = require("./User");

let chatroomSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    messages:[{
        type: Object,
        
    }],

   
})

let Chatroom=mongoose.model('chatroom',chatroomSchema)


module.exports.Chatroom=Chatroom