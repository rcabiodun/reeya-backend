const mongoose  = require("mongoose");
const { OrderItem } = require("./models/orderItem");

function dbConnector() {
    mongoose.connect("mongodb://localhost/reeya").then(()=>{
        console.log("Connected to the db")
        

    }).catch((err)=>{
        console.log(`Error occured boss ${err}`)
    });

}
module.exports.dbConnector = dbConnector;