const express = require('express')
const bookingRoute = express.Router()
const decodeMiddleware = require('../middlewares/decode')
const { asyncMiddleware } = require('../middlewares/asyncMiddleware')
const { Profile } = require('../models/Profile')
const { User } = require('../models/User')


bookingRoute.get('/books', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
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


module.exports = bookingRoute