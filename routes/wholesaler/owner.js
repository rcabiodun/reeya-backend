const express = require('express')
const onwerRoute = express.Router()
const { Station } = require('../../models/Station')
const { asyncMiddleware } = require('../../middlewares/asyncMiddleware')
const decodeMiddleware = require('../../middlewares/decode')
const { Item } = require('../../models/Item')
const { authorizationMiddleware } = require('../../middlewares/authorization')
const { OrderItem } = require('../../models/orderItem')


//have all been tested boss
onwerRoute.post('/item/create', [decodeMiddleware,authorizationMiddleware], asyncMiddleware(async (req, res, next) => {
    let item=new Item(req.body)
    item.wholesaler=req.user_stationId
    await item.save()
    res.json(item).status(200)
}))

onwerRoute.put('/item/:id', [decodeMiddleware,authorizationMiddleware], asyncMiddleware(async (req, res, next) => {

    let item=await Item.findOneAndUpdate({wholesaler:req.user_stationId,_id:req.params.id}, req.body, { new: true }).populate('wholesaler')
    res.json(item).status(200)
}))

onwerRoute.get('/item/:id', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
   let item=await Item.findById(req.params.id).populate("wholesaler")
   res.json(item).status(200)


}))

onwerRoute.get('/all/items', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    console.log(req.user_stationId)
    let items=await Item.find({wholesaler:req.user_stationId})
    res.json(items).status(200)
 
 
 }))
 
 onwerRoute.post('/pending_orders', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {

    let orderItems = await OrderItem.find({
        wholesaler: req.user_stationId, status:
        {
            $in:
                ["ordered", "accepted", "declined", "onroute","in transit"]
        }
    }).populate("item").populate("retailer")
    console.log(orderItems)

    res.json(orderItems)



}))






module.exports = onwerRoute
