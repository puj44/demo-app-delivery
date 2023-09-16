import db from "../../db";
const conn = await db();

export async function GET(req, res) {
    try {
        const search = req.nextUrl?.searchParams?.get('search');
        const res = await conn.all(`SELECT 
            invoices.id AS invoice_id,
            invoices.invoice_number AS invoice_number,
            SUM(invoice_details.ordered_qty) AS total_ordered_qty,
            SUM(invoice_details.scanned_qty) AS total_scanned_qty,
            COUNT(invoice_details.product_id) AS total_products,
            vendors.vendor_name AS vendor_name,
            locations.name AS location_name,
            invoices.created_at AS date
            FROM invoices 
            LEFT JOIN invoice_details ON invoices.id = invoice_details.invoice_id 
            LEFT JOIN vendors ON vendors.id = invoices.vendor_id
            LEFT JOIN locations ON locations.id = invoices.location_id
            ${search && search?.toString()?.trim() !== "" ? `WHERE LOWER(invoice_number) LIKE '%${search?.toString()?.trim()?.toLowerCase()}%'` : ""}
            GROUP BY invoice_details.invoice_id
        `);
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
export const dynamic = 'force-dynamic'
export const dynamicParams = true