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
export async function GET(req, res) {
    try {
        const search = req.nextUrl?.searchParams?.get('search');
        if (search) {
            const res = await conn.all(`SELECT * FROM products WHERE LOWER(product_name) LIKE '%' || ? || '%' `, search?.toString().trim());
            return new Response(JSON.stringify(res), {
                headers: { "Content-Type": "application/json" },
                status: 200,
                message: "Products fetched successfully"
            });
        }else{
            const res = await conn.all(`SELECT * FROM products `);
            return new Response(JSON.stringify(res), {
                headers: { "Content-Type": "application/json" },
                status: 200,
                message: "Products fetched successfully"
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: err.message
        }));
    }
}