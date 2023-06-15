const express = require('express')
const app = express()
const helmet = require('helmet')
const compression = require('compression')
const http = require('http')
const { Server } = require('socket.io')
const db = require('./dbConnector')
const homeRoute = require('./routes/home_page')
const morgan = require('morgan');
const AccountRoute = require('./routes/registration')
const cors = require('cors');
const { Chatroom } = require('./models/Chatrroom')
const { Profile } = require('./models/Profile')

const jwt = require('jsonwebtoken')
const StationRoute=require('./routes/station')
const WholesalerOwnerRoute=require('./routes/wholesaler/owner')
const WholesalerWorkerRoute=require('./routes/wholesaler/worker')
const { RetailerRoute } = require('./routes/retailer/owner')
const { dispatchRoute } = require('./routes/dispatcher/ownerAndWorker')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(morgan("dev"))

let port=process.env.PORT||3000

let address=process.env.ADDRESS||"127.0.0.1"
app.use(helmet())
app.use(compression())
const server = http.createServer(app)
app.get('profile_page', (req, res) => {
    res.send(profile_page)
})
app.use(cors())
db.dbConnector();
let ids = [1]

app.use("/api/account", AccountRoute)
app.use("/api/home", homeRoute)
app.use("/api/station", StationRoute)
app.use("/api/wholesaler/owner", WholesalerOwnerRoute)
app.use("/api/wholesaler/worker", WholesalerWorkerRoute)
app.use("/api/retailer/worker_and_owner", RetailerRoute)
app.use("/api/dispatcher/worker_and_owner", dispatchRoute)



app.use((req, res, next) => {
    res.status(404)
    res.json({ "message": "Endpoint not found boss" })

})

app.use((err, req, res, next) => {
    res.status(500)
    res.json({ "message": err })

})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
