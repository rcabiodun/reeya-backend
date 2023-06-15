const mongoose  = require("mongoose");
const { OrderItem } = require("./models/orderItem");

function dbConnector() {
    mongoose.connect("mongodb+srv://rcabiodun:UuHbvdKNDOqjdnUo@cluster0.jgfw3db.mongodb.net/?retryWrites=true&w=majority").then(()=>{
        console.log("Connected to the db")
        

    }).catch((err)=>{
        console.log(`Error occured boss ${err}`)
    });

}
module.exports.dbConnector = dbConnector;