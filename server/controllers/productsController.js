const db = require('../db');
const messages = require('../commonHelpers/errors');
exports.addProduct = async (req, res) => {
    try {
        const { product_name, code, available_qty } = req.body;
        if(product_name && product_name?.toString().trim() !== ""){
            await db.query(`INSERT INTO products(product_name,code,available_qty) VALUES('${product_name}',${code},${available_qty})`, (err, results) => {
                if (err) {
                    res.json({ status: 400, message: messages[err?.constraint] ?? err.message });
                }
                else{
                    res.json({ status: 200, message: "Product created successfully" })
                }
            });
        }else{
            res.json({status:400, message:"Product Name must not be empty string"})
        }
    } catch (err) {
        res.json({ status: 500, message: err.message })
    }
}
exports.getProductDetails = async (req, res) => {
    try {
        await db.query(`SELECT * FROM products WHERE id = ${req.params.id}`, (err, results) => {
            if (err) {
                res.json({ status: 400, message: err.message });
            }
            res.json({ status: 200, message: "Product fetched successfully", data: results?.rows[0] ?? {} })
        });
    } catch (err) {
        res.json({ status: 500, message: err.message })
    }
}