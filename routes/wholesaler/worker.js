const express = require('express')
const workerRoute = express.Router()
const { Station } = require('../../models/Station')
const { asyncMiddleware } = require('../../middlewares/asyncMiddleware')
const decodeMiddleware = require('../../middlewares/decode')
const { Item } = require('../../models/Item')
const { OrderItem } = require('../../models/orderItem')

//can only accept and decline ordered-items 
//have not been tested yet
workerRoute.put('/ordereditem/changestatus/:id', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let ordereditem = await OrderItem.findByIdAndUpdate(req.params.id, {
        $set: {
            status: req.body.status
        },
    }, { new: true })

    let orderItems = await OrderItem.find({
        wholesaler: ordereditem.wholesaler, status: "ordered"
    })

    console.log(orderItems)
 
    orderItems.map(async(v, i) => {
       v.status=req.body.status
      await v.save()
    })
    await ordereditem.save()
    res.json({message:`Status set to ${req.body.status}`})
}))












module.exports = workerRoute
