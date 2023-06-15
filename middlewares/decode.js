const jwt = require("jsonwebtoken")
const { Profile } = require("../models/Profile")
const { Station } = require("../models/Station")


let decode = async (req, res, next) => {
    let token = req.headers.auth
    let result = jwt.verify(token, "cash2me")
    req.user_id = result.id
    let userProfile = await Profile.findOne({ user: req.user_id })
    if (userProfile) {

        req.user_profileId = userProfile._id

        if (userProfile.role == "OWNER") {
            let station = await Station.findOne({ owner: userProfile._id })
            req.user_stationId = station?station._id:null
        } else {
            let station = await Station.findOne({ workers: userProfile._id })
            req.user_stationId = station?station._id:null
        }

    }
    
    next();
}

module.exports = decode