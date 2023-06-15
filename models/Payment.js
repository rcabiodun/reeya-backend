const Joi = require("joi");
const mongoose = require("mongoose");
const { Item } = require("./Item");
const { Profile } = require("./Profile");
const { Station } = require("./Station");
const jwt = require("jsonwebtoken");

let Paymentschema = new mongoose.Schema({

    amount: {
        type: Number,
        default: 0
    },

    ref: {
        type: String,
        
    },
    email: {
        type: String,
    },
    verified:{
        type:Boolean,
        default:false
    },
    wholesaler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },

    retailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },

    dispatcher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },
  


})
Paymentschema.methods.genToken=function(){
    
    const token=jwt.sign({id:this._id},"cash2me")
    return token;
}

let Payment = mongoose.model('payment', Paymentschema)



module.exports.Payment = Payment