import db from "../db";
import messages from "../errors";
const conn = await db();
export async function POST(req, res) {
    try {

        const { product_name, code, available_qty } = await req.json();
        if (!product_name || !code) {
            throw new Error("Product name and code is required")
        }
        await conn.run("INSERT INTO products(product_name, code, available_qty) VALUES(?,?,?)", [product_name, code, available_qty]);
        return new Response(JSON.stringify({ status: 200, message: "Product created successfully" }));
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: messages[err.code] ? `Product or Code ${messages[err.code]}` : err.message
        }));
    }
}