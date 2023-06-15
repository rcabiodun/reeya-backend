const jwt = require("jsonwebtoken")
const { Profile } = require("../models/Profile")
const { Station } = require("../models/Station")
const bugger = require('debug')("app:authorization")

//will help in ensuring only workers do what they are meant to do
let authorization = async (req, res, next) => {


    bugger(req.user_profileId)
    let station = await Station.findOne({ workers: req.user_profileId })
    if (station){
        return res.json("You are not authorized to perform this action ")
    }
    next();
}

module.exports.authorizationMiddleware = authorization