const express = require('express')
const homeRoute = express.Router()
const decodeMiddleware = require('../middlewares/decode')
const { asyncMiddleware } = require('../middlewares/asyncMiddleware')
const { Profile } = require('../models/Profile')
const { User } = require('../models/User')
const { Chatroom } = require('../models/Chatrroom')


homeRoute.get('/home_page', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let currentUser = await User.findById(req.user_id)
    let currentUserprofile = await Profile.findOne({ user: req.user_id })

    if (!currentUser) {
        await currentUserprofile.delete()
        return res.json({ "message": "Account has been deleted" })
    }

    if (!currentUserprofile) {
        return res.json({ "message": "Profile not created" })
    }
    let cashAgents = await Profile.find({ school: currentUserprofile.school, user_type: "Cash Agent", is_available: true }).skip((req.query.page - 1) * 1).limit(200).populate("user")
    return res.json(cashAgents)
}))


homeRoute.get('/friends', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let currentUserprofile = await Profile.findOne({ user: req.user_id })
    var userReg = `.*${currentUserprofile._id}.*`;
    var userIDregEx = new RegExp(userReg)
    let chatrooms = await Chatroom.find({ name: userIDregEx })
    let msgRecivers = []
    console.log(currentUserprofile._id)
    chatrooms.map((v, i) => {
        let roomMembers = v.name.split("--")
        roomMembers.find((v2, i) => {
            if (v2 == currentUserprofile._id) {
                let m = 22
            } else {
                msgRecivers.push(v2)
            }
        })
    })
    let msgReciversProfiles = await Profile.find({ _id: { $in: msgRecivers } }).populate("user")

    res.json(msgReciversProfiles)
}))
module.exports = homeRoute