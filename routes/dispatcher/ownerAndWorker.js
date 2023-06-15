const express = require('express')
const dispatchRoute = express.Router()
const { Station } = require('../../models/Station')
const { asyncMiddleware } = require('../../middlewares/asyncMiddleware')
const decodeMiddleware = require('../../middlewares/decode')
const { Item } = require('../../models/Item')
const { OrderItem } = require('../../models/orderItem')


dispatchRoute.put('/view_incoming_deliveries', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let userStation = await Station.findOne({ _id: req.user_stationId })
    let wholesalers = await Station.find({ location: userStation.location, station_type: "wholesaler" })
    let wholesalersIds = []
    wholesalers.map(v => wholesalersIds.push(v._id))
    let ordereditems = await OrderItem.find({
        wholesaler: { $in: wholesalersIds }, status:
            { $in: ["accepted", "onroute", "in transit"] }
    }).populate("retailer").populate("wholesaler").populate("item")
    res.json(ordereditems).status(200)

}))


dispatchRoute.get('/ordereditems', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let ordereditems = await OrderItem.find({
        wholesaler: req.user_stationId, status:
            { $in: ["ordered", "accepted", "declined", "onroute"] }
    }).populate("retailer")
    res.json(ordereditems).status(200)
}))
dispatchRoute.put('/ordereditem/changestatus/:id', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let ordereditem = await OrderItem.findByIdAndUpdate(req.params.id, {
        $set: {
            status: req.body.status,
            dispatcher: req.user_stationId
        },
    }, { new: true })
    let orderItems = await OrderItem.find({
        wholesaler: ordereditem.wholesaler, status: "accepted"
    })

 
    orderItems.map(async (v, i) => {
       v.status="in transit"
      await v.save()
    })
    await ordereditem.save()
    res.json({ message: `Status set to ${req.body.status}` })
}))







module.exports.dispatchRoute = dispatchRoute
