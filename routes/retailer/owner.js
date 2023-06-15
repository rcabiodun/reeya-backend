const express = require('express')
const onwerRoute = express.Router()
const { Station } = require('../../models/Station')
const { asyncMiddleware } = require('../../middlewares/asyncMiddleware')
const decodeMiddleware = require('../../middlewares/decode')
const { Item } = require('../../models/Item')
const { OrderItem } = require('../../models/orderItem')
const { Order } = require('../../models/Order')
const { Payment } = require('../../models/Payment')
const { Profile } = require('../../models/Profile')
const bugger = require('debug')("app:retailer")
const axios = require('axios');
const { set } = require('mongoose')

//have not been tested yet
onwerRoute.post('/add_to_cart/:id', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let checkingOrder = await Order.findOne({ buyer: req.user_stationId, is_ordered: false })
    let item = await Item.findOne({ _id: req.params.id })
    let orderitem = await OrderItem.findOne({ item: req.params.id, status: "dormant", retailer: req.user_stationId })
    if (!orderitem) {
        //if there isn't an order item,we create one
        bugger("1")

        orderitem = new OrderItem({
            item: req.params.id,
            status: "dormant",
            retailer: req.user_stationId,
            wholesaler: item.wholesaler,
            quantity: req.body.quantity,

        })
        orderitem.total_price = item.price * orderitem.quantity
        bugger("2")

    }

    if (checkingOrder) {
        bugger("3")

        if (checkingOrder.items.includes(orderitem._id)) {
            bugger("4")

            orderitem.quantity += 1
            //Need to make accommodation for items on discount
            orderitem.total_price = item.price * orderitem.quantity
            await orderitem.save()
            return res.json({ "message": "Item quantity has been increased" }).status(200)
        } else {
            bugger("5")
            if (checkingOrder.items.length > 0) {
                let firstItem = checkingOrder.items[0]
                let full_first_item = await OrderItem.findOne({ _id: firstItem._id })
                console.log(full_first_item.wholesaler.id, orderitem.wholesaler.id)
                full_first_item.wholesaler.equals(orderitem.wholesaler.id)
                if (full_first_item.wholesaler._id.toString() === orderitem.wholesaler._id.toString()) {

                    await orderitem.save()
                    checkingOrder.items.push(orderitem)

                    await checkingOrder.save()
                    return res.json({ "message": "Item  has added to cart" }).status(200)
                    console.log("They are the same bro")

                } else {

                    orderitem.status = "removed"

                    console.log("Not same bro")
                    res.json({ "message": "Items in cart must have the same vendor" }).status(200)

                }

            } else {
                await orderitem.save()
                checkingOrder.items.push(orderitem)

                await checkingOrder.save()
                return res.json({ "message": "Item  has added to cart" }).status(200)

            }



        }

    } else {
        await orderitem.save()

        let order = new Order(
            {
                buyer: req.user_stationId,
                is_ordered: false
            }
        )
        order.items.push(orderitem)
        await order.save()
        return res.json({ "message": "Cart  has been created" }).status(201)

    }
}))

onwerRoute.post('/decrease_from_cart/:id', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let checkingOrder = await Order.findOne({ buyer: req.user_stationId, is_ordered: false })
    let item = await Item.findOne({ _id: req.params.id })

    let orderitem = await OrderItem.findOne({ item: req.params.id, status: "dormant", retailer: req.user_stationId })

    if (!orderitem) {
        return res.json({ "message": "Item is not in your cart" })
    }
    if (checkingOrder.items.includes(orderitem._id)) {
        orderitem.quantity -= 1
        orderitem.total_price = item.price * orderitem.quantity

        if (orderitem.quantity <= 0) {
            //if quantity is zero,item has to be removed from cart
            orderitem.status = "removed"
            await orderitem.save()

            checkingOrder.items = checkingOrder.items.filter((v, i) => {
                bugger(v)
                bugger(orderitem._id)


                if (orderitem._id.equals(v)) {
                    bugger("same")

                } else {
                    return v
                }
            })
            bugger(checkingOrder.items)
            await checkingOrder.save()
            return res.json({ "message": "Item has been removed" }).status(200)

        }
        await orderitem.save()

        return res.json({ "message": `Item quantity has been decreased to ${orderitem.quantity}` }).status(200)
    } else {
        return res.json({ "message": "Item is not in your cart" }).status(200)

    }


}))



onwerRoute.get('/cart', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let checkingOrderItems = await OrderItem.find({ retailer: req.user_stationId, status: "dormant" }).populate("item")
    res.json(checkingOrderItems).status(200)

}))

onwerRoute.post('/checkout', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    await Order.findOneAndUpdate({ retailer: req.user_stationId, is_ordered: false }, {
        $set: {
            is_ordered: true

        }
    })
    let orderItems = await OrderItem.find({ retailer: req.user_stationId, status: "dormant" })
    orderItems.map(async (v, i) => {
        v.status = 'ordered'
        v.address = req.body.address
        await v.save()
    })
    res.json({ message: "Order has been placed" })



}))

onwerRoute.post('/pending_orders', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {

    let orderItems = await OrderItem.find({
        retailer: req.user_stationId, status:
        {
            $in:
                ["ordered", "accepted", "declined", "onroute", "in transit"]
        }
    }).populate("item")
    console.log(orderItems)

    res.json(orderItems)



}))
onwerRoute.post('/initiate_payments/:id', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let delivery_fee = 2000

    // Create a config object with the authorization header


    let orderItem = await OrderItem.findOne({
        _id: req.params.id
    })

    let orderItems = await OrderItem.find({
        wholesaler: orderItem.wholesaler, status: "in transit"
    })

    let totalOrderItemsfee = 0
    orderItems.map((v, i) => {
        totalOrderItemsfee = totalOrderItemsfee + v.total_price
    })
    let userProfile = await Profile.findOne({ _id: req.user_profileId })

    let total_fee = totalOrderItemsfee + delivery_fee
    let payment = new Payment(
        {
            amount: total_fee * 100,
            email: userProfile.email,
            retailer: orderItem.retailer,
            wholesaler: orderItem.wholesaler,
            dispatcher: orderItem.dispatcher
        }
    )
    while (!payment.ref) {
        let ref = payment.genToken()
        let payment_with_similar_ref = await Payment.findOne({ ref: ref })
        if (!payment_with_similar_ref) {
            payment.ref = ref
        }
    }

    await payment.save()
    let base_url = 'https://api.paystack.co'
    let path = '/transaction/initialize/'
    const config = {
        headers: {
            Authorization: 'Bearer sk_test_7731c88b0b5e13e70f73211704179bd06f354efe'
        }
    };
    let url = base_url + path
    const response = await axios.post(url,
        {
            email: payment.email,
            amount: payment.amount,
            reference: payment.ref

        }
        , config)
    orderItems.map(async (v, i) => {
        v.status = "payed"
        await v.save()
    })
    console.log(response)
    console.log(response.data.data)
    
    let wholesaler= await Station.findOne({ _id: orderItem.wholesaler._id })
    let dispatcher= await Station.findOne({ _id: orderItem.dispatcher._id })

    wholesaler.wallet+=totalOrderItemsfee
    dispatcher.wallet+=delivery_fee
    await wholesaler.save()
    await dispatcher.save() 
    return res.json(response.data.data)


}))


onwerRoute.post('/all_items', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let category = req.body.category
    console.log(category)
    let items = category == "All" ? await Item.find().populate("wholesaler") : await Item.find({ category: category }).populate("wholesaler")
    console.log(items)
    res.json(items).status(200)
}))

onwerRoute.post('/search', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let query = req.body.query
    let me = "e"
    query = `.*${query}.*`;
    var queryreg = new RegExp(query)
    let items = await Item.find({ title: queryreg }).populate("wholesaler")
    res.json(items).status(200)
}))

onwerRoute.post('/item_by_wholesaler/:wholesalerId', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let items = await Item.find({ wholesaler: req.params.wholesalerId })
    res.json(items).status(200)
}))




module.exports.RetailerRoute = onwerRoute
