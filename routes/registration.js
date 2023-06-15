const express = require('express')
const accRoute = express.Router()
const bcrypt = require('bcrypt')
const { UserValidator, User } = require('../models/User')
const { asyncMiddleware } = require('../middlewares/asyncMiddleware')
const decodeMiddleware = require('../middlewares/decode')
const { Profile, profileValidator } = require('../models/Profile')
const { Station } = require('../models/Station')
    
accRoute.post('/registration', asyncMiddleware(async (req, res, next) => {
    let { error } = UserValidator.validate(req.body)
    if (error) {
        next(error.details[0].message)
    }
    let checkingUser = await User.findOne({ username: req.body.username })
    if (checkingUser) {
        return res.json({ "message": "user already exists" })
    }

    let badWords = ["yansh", "dick", "cum", "ass", "fuck", "asf", "mf", "asshole", "pussy", "penis", "boobs", "vagina"]

    let checkingBadwords = badWords.filter((v, i) => {
        let username = req.body.username.toLowerCase()
        if (username.includes(v)) {
            return v
        }
    })
    if (checkingBadwords.length > 0) {
        return res.json({ "message": "kindly input a proper name" })

    }



    let user = new User(req.body)
    const salt = await bcrypt.genSalt(10)
    let hash = await bcrypt.hash(user.password, salt)
    user.password = hash
    user.username = user.username.trim()
    await user.save()
    let token = user.genToken()
    return res.json({ "auth_token": token })
}
));



accRoute.post('/login', asyncMiddleware(async (req, res, next) => {
    console.log(req.body)
    let user = await User.findOne({ username: req.body.username })
    console.log(user)
    if (!user) {
        return res.json({ "message": "User not found" })
    }

    console.log(user)
    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
        return res.json({ "message": "Incorrect details" })
    }
    const profile = await Profile.findOne({ user: user })
    //for it to store on the phone i need to make it a string
    let hasStation = "false"
    let station = "null"
    if (profile.role == "OWNER") {
        station = await Station.findOne({ owner: profile._id })
        hasStation = station ? "true" : "false"
    } else {
        station = await Station.findOne({ workers: profile._id })
        hasStation = station ? "true" : "false"

    }

    let station_type = station ? station.station_type : "null"

    return res.json({ "auth_token": user.genToken(), role: profile.role, has_station: hasStation, station_type: station_type })
}))


accRoute.post('/profile', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    console.log(req.body.rate)


    let { error } = profileValidator.validate(req.body)
    if (error) {
        next(error.details[0].message)
        return;
    }
    try {
        let profile = new Profile(req.body)
        profile.user = req.user_id

        await profile.save()
        res.json(profile)
    } catch (err) {
        res.json({ "message": "You already have a profile." })
    }

}))

accRoute.get('/profile', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let profile = await Profile.findOne({ user: req.user_id }).populate('user')
    res.json(profile)
}))

accRoute.put('/profile', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let profile = await Profile.findOneAndUpdate({ user: req.user_id }, req.body, { new: true }).populate("user")
    res.json(profile)

}))

accRoute.get('/station_list', asyncMiddleware(async (req, res, next) => {
    let stations = await Station.find({is_verified:false})
    res.json(stations)
}))

accRoute.put('/station/approve/:id', asyncMiddleware(async (req, res, next) => {
    let stations = await Station.findOne({_id:req.params.id})
    stations.is_verified=true
    await stations.save()
    res.json({"message":`${stations.title} is now verified`})
}))

module.exports = accRoute
