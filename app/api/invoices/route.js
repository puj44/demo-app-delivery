import db from "../db";
import messages from "../errors";
import validator from "../../../components/common/validator"
import sqlite3 from "sqlite3";
const conn = await db();

export async function POST(req, res) {
    try {
        const requiredFields = [{ vendor_id: "Vendor" }, { location_id: "Location" }, { products: "Products", type: "array" }];
        let data = await req.json();
        const result = await validator(data, requiredFields);
        if (result?.length) {
            return new Response(JSON.stringify({
                status: 400,
                message: result
            }));
        }
        data.invoice_number = "INV1001";
        const exists = await conn.get("SELECT invoice_number FROM invoices ORDER BY id DESC");
        if (exists && exists?.invoice_number) {
            let val = Number(exists.invoice_number?.split("INV")?.[1]);
            const number = val + 1;
            data.invoice_number = "INV" + number;
        }
        const res = await conn.run("INSERT INTO invoices(invoice_number, vendor_id, location_id, created_at) VALUES(?,?,?,datetime('now','localtime'))", [data.invoice_number, data.vendor_id, data.location_id]);

        const invoiceID = res?.lastID;
        if (invoiceID) {
            if (data.products?.length) {
                let statements = [];
                let errors = [];
                data.products?.map(async (d, i) => {
                    if (!d?.product_id) {
                        errors.push(`products.${i + 1}.id is required`);
                        // throw new Error(msg);
                    } else {
                        statements.push(["INSERT INTO invoice_details(invoice_id, product_id, ordered_qty, scanned_qty) VALUES(?,?,?,?)", [invoiceID, d.product_id, d.ordered_qty ?? 0, d.scanned_qty ?? 0]]);
                    }
                })
                if (errors.length) {
                    await conn.run("DELETE FROM invoices WHERE id = ?", invoiceID);
                    throw new Error(errors)
                } else {
                    statements?.length && statements.map(async (stmt, idx) => {
                        await conn.run(...stmt, async function (err) {
                            if (err) { await conn.run("DELETE FROM invoices WHERE id = ?", invoiceID); throw new Error(err) }

                        })
                    })
                }
            }
        }

        return new Response(JSON.stringify({ status: 200, message: "Invoice created successfully" }));
    } catch (err) {
        conn.run("ROLLBACK");
        return new Response(JSON.stringify({
            status: 500,
            message: err.message
        }));
    }
}

export async function DELETE(req, res) {
    try {
        await conn.run('DELETE FROM invoices');
        await conn.run('DELETE FROM invoice_details');
        return new Response(JSON.stringify({ status: 200, message: "Invoice deleted successfully" }));
    } catch (err) {
        return new Response(JSON.stringify({
            status: 500,
            message: err.message
        }));
    }
}