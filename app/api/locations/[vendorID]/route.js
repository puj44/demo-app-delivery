import db from "../../db";
import messages from "../../errors";
const conn = await db();
export async function GET(req, res) {
    try {
        const id = req.url.split("/").pop();
        const res = await conn.all("SELECT * FROM locations where vendor_id = ?", id);

        if (!res) {
            throw new Error("Locations not found")
        }
        return new Response(JSON.stringify(res), {
            headers: { "Content-Type": "application/json" },
            status: 200,
            message: "Locations fetched successfully"
        });
    } catch (err) {
        return new Response([], {
            status: 500,
            message: err.message
        });
    }
}