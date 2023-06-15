const Joi = require("joi");
const mongoose = require("mongoose");
const { OrderItem } = require("./orderItem");
const { Profile } = require("./Profile");
const { Station } = require("./Station");


let OrderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },


    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: OrderItem,
    }],

    ref: {
        type:String,

    },

    is_ordered: {
        type: Boolean,
        default: false
    },

})

let Order = mongoose.model('order', OrderSchema)



module.exports.Order = Order