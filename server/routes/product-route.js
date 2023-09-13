// Import express
const express = require('express')

const products = require('./../controllers/productsController.js')

const router = express.Router()

router.post('/add', products.addProduct);
router.get('/get-product-details/:id', products.getProductDetails)
module.exports = router