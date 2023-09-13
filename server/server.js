// Import dependencies

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require("dotenv").config();

const productRouter = require('./routes/product-route')
const vendorRouter = require('./routes/vendor-route')
const invoiceRouter = require('./routes/invoice-route')

const PORT = process.env.NODE_ENV_PORT || 4001

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/products', productRouter)
app.use('/vendors', vendorRouter)
app.use('/invoices', invoiceRouter)

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something went wrong')
})

app.use(function (req, res, next) {
    res.status(404).send('Sorry we could not find that.')
})

app.listen(PORT, function () {
    console.log(`Server is running on: ${PORT}`)
})