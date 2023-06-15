const Joi = require("joi");
const mongoose = require("mongoose");
const { Item } = require("./Item");
const { Profile } = require("./Profile");
const { Station } = require("./Station");

let OrederitemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Item,
    },
   
    total_price: {
        type: Number,
        default:200
    },

    quantity: {
        type: Number,
        required: true,
        default:1
    },

    retailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },

    wholesaler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },
    status:{
        type:String,
        enum:["dormant","ordered","accepted","declined","onroute","delivered","removed","in transit","payed"],
        default:"dormant"
    },
    dispatcher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Station,
    },
    date_ordered:{
        type:Date,
        
    },
    address:{
        type:String,
        
    }

    
})

let Orderitem = mongoose.model('orderitem', OrederitemSchema)



module.exports.OrderItem= Orderitem