import db from "../db";
import messages from "../errors";
const conn = await db();
export async function GET(req, res) {
    try {
        const search = req.nextUrl?.searchParams?.get('search');
        if (search) {
            const res = await conn.all(`SELECT * FROM vendors WHERE LOWER(vendor_name) LIKE '%' || ? || '%' `, search?.toString().trim());
            return new Response(JSON.stringify(res), {
                headers: { "Content-Type": "application/json" },
                status: 200,
                message: "Product fetched successfully"
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: err.message
        }));
    }
}
export async function POST(req, res) {
    try {

        const { vendor_name } = await req.json();
        if (!vendor_name) {
            throw new Error("Vendor name and code is required")
        }
        const res = await conn.run("INSERT INTO vendors(vendor_name) VALUES(?)", [vendor_name]);
        return new Response(JSON.stringify({ status: 200, message: "Vendor created successfully" }));
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: messages[err.code] ? `Vendor ${messages[err.code]}` : err.message
        }));
    }
}