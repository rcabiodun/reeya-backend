const express = require('express')
const stationRoute = express.Router()
const { Station } = require('../models/Station')
const { asyncMiddleware } = require('../middlewares/asyncMiddleware')
const decodeMiddleware = require('../middlewares/decode')
const mongoose = require("mongoose")

stationRoute.post('/create', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let station_exists = await Station.findOne({ owner: req.user_profileId })
    console.log(station_exists)
    if (station_exists) {
        return res.json({ "message": "You have already created a station boss. " })
    }
    let station = new Station(req.body)
    station.owner = req.user_profileId
    await station.save()
    return res.json(station)
}))

stationRoute.put('/add_workers', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {

    let workers_ids = []
    req.body.workers_ids.filter((v, i) => {
        //checking to see if the person is already working for a station
        Station.findOne({ workers: v }).then((result) => {
            if (!result) {
                workers_ids.push(v)

            } else {
                console.log("Already a worker")
                return res.json({message:"Already a worker"})

            }

        }).catch(err => { throw new Error(err) })

    })

    console.log(workers_ids)
    try {
        let station = await Station.findOne({ owner: req.user_profileId }).populate(["workers", "owner"])
        station.workers = [...station.workers, ...workers_ids]
        await station.save()
        //had to do it again for the workers array to be populated 
        station = await Station.findOne({ owner: req.user_profileId }).populate(["workers", "owner"])
        return res.json(station.workers)
    } catch (err) {
        console.log(err)
        throw new Error("You have not created an account boss. ")
    }


}))

stationRoute.put('/remove_worker', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let station = await Station.findOne({ owner: req.user_profileId })
    console.log(req.body)
    
    station.workers= station.workers.filter((v, i) => {
        if (v == req.body.workers_ids) {
            console.log(v)

        } else {
            return v
        }
    })
    console.log(station.workers)

    await station.save()
    station = await Station.findOne({ owner: req.user_profileId }).populate(["workers", "owner"])

    return res.json(station.workers)

}))

stationRoute.get('/view_workers', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    let station = await Station.findOne({ owner: req.user_profileId }).populate(["workers", "owner"])

    return res.json(station.workers)

}))


stationRoute.get('/view_wallet', [decodeMiddleware], asyncMiddleware(async (req, res, next) => {
    console.log("btich")
    let station = await Station.findOne({ _id:req.user_stationId })

    return res.json(station)

}))









module.exports = stationRoute
