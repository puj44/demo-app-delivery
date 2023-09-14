import db from "../db";
import messages from "../errors";
import validator from "../../../components/common/validator"
const conn = await db();
export async function POST(req, res) {
    try {
        const requiredFields = [{ name: "Name" }, { address: "Address" }, { state: "State" }, { city: "City" }, { vendor_id: "Vendor" }];
        const data = await req.json();
        const result = await validator(data, requiredFields);
        if (result?.length) {
            return new Response(JSON.stringify({
                status: 400,
                message: result
            }));
        }
        await conn.run("INSERT INTO locations(name, address, state, city, vendor_id) VALUES(?,?,?,?,?)", [data.name, data.address, data.state, data.city, data.vendor_id]);
        return new Response(JSON.stringify({ status: 200, message: "Location created successfully" }));
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: err.message
        }));
    }
}