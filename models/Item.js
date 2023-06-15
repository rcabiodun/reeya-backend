const Joi = require("joi");
const mongoose = require("mongoose");
const { Profile } = require("./Profile");
const { Station } = require("./Station");


let ItemSchema = new mongoose.Schema({
    wholesaler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },

    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,

    },

    discount_price: {
        type: Number,
        default: 0
    },

    is_on_discount: {
        type: Boolean,
        default: false
    },
    is_available: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        required: true
    },
    batch:{
        type: String,
        required: true
    },image:{
        type:String,
        required:true

    }

})

let Item = mongoose.model('item', ItemSchema)



module.exports.Item = Item