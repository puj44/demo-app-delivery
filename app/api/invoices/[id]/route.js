import db from "../../db";
const conn = await db();

export async function GET(req, res) {
    try {
        const id = req.url.split("/").pop();
        const res = await conn.get(`SELECT 
                invoices.id AS invoice_id,
                invoices.invoice_number AS invoice_number,
                json_group_array(json_object('product_id',products.id,'product_name',products.product_name,'ordered_qty',invoice_details.ordered_qty,'scanned_qty',invoice_details.scanned_qty)) AS products,
                SUM(invoice_details.ordered_qty) AS total_ordered_qty,
                SUM(invoice_details.scanned_qty) AS total_scanned_qty,
                COUNT(invoice_details.product_id) AS total_products,
                vendors.vendor_name AS vendor_name,
                locations.name AS location_name,
                invoices.created_at AS date
                FROM invoices 
                
                LEFT JOIN invoice_details ON invoices.id = invoice_details.invoice_id 
                LEFT JOIN products ON invoice_details.product_id = products.id
                LEFT JOIN vendors ON vendors.id = invoices.vendor_id
                LEFT JOIN locations ON locations.id = invoices.location_id
                WHERE invoices.id = $1
                GROUP BY invoice_details.invoice_id
            `, [id]);
        return new Response(JSON.stringify(res), {
            headers: { "Content-Type": "application/json" },
            status: 200,
            message: "Invoices fetched successfully"
        });
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: err.message
        }));
    }
}