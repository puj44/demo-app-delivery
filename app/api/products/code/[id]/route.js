import db from "../../../db";
const conn = await db();
export async function GET(req, res) {
    try {
        const id = req.url.split("/").pop();
        const res = await conn.get("SELECT * FROM products where code = ?", id);

        if (!res) {
            throw new Error("Product not found")
        }
        return new Response(JSON.stringify(res), {
            headers: { "Content-Type": "application/json" },
            status: 200,
            message: "Product fetched successfully"
        });
    } catch (err) {
        return new Response([], {
            status: 500,
            message: err.message
        });
    }
}