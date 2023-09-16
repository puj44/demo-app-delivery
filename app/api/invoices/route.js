import db from "../db";
import messages from "../errors";
import validator from "../../../components/common/validator"
import sqlite3 from "sqlite3";
import arrayValidator from "@/components/common/arrayValidation";
const conn = await db();
function db_run_promise(sql, arrayParam) {
    return new Promise((resolve, reject) => {
        conn.run(...sql, (err) => {
            if (err) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        })
    });
}
async function multipleExecSQLWithTransaction(arraySqls) {

    let auxPromise = new Promise((resolve, reject) => {
        const myfunc = async () => {
            let passed = true;
            for (var i = 0; i < arraySqls.length; i++) {
                let theSql = arraySqls[i];
                auxResult = await db_run_promise(theSql);
                if (auxResult == false) {
                    passed = false;
                    break;
                }
            }
            if (passed == false) {
                conn.exec("ROLLBACK");
                return false;
            }
            else {
                conn.exec("COMMIT");
                return true;
            }
        }

        try {
            let aux = myfunc();
            resolve(aux);
        }
        catch (errT) {
            resolve(false);
        }
    });

    return auxPromise;
}
export async function POST(req, res) {
    try {
        await conn.exec("SAVEPOINT BEFORE_INVOICE");
        const requiredFields = [{ vendor_id: "Vendor" }, { location_id: "Location" }, { products: "Products", type: "array" }];
        const productsValidation = [
            {
                title: "Product",
                field: "product_id",
                type: "number"
            },
            {
                title: "Ordered Qty",
                field: "ordered_qty",
                type: "number"
            },
            {
                title: "Scanned Qty",
                field: "scanned_qty",
                type: "number"
            },
        ];
        const rollbackToSavePoint = async (savepointName) => {
            await conn.run(`ROLLBACK TO ${savepointName}`);
        }

        let data = await req.json();
        const result = await validator(data, requiredFields);
        const isValid = await arrayValidator(data?.products, productsValidation);
        data.invoice_number = "INV1001";
        if (result?.length) {
            return new Response(JSON.stringify({
                status: 400,
                message: result
            }));
        }
        if (isValid?.length) {
            return new Response(JSON.stringify({
                status: 400,
                message: isValid
            }));
        }
        const exists = await conn.get("SELECT invoice_number FROM invoices ORDER BY id DESC").catch((err) => {
            throw new Error(err);
        });
        if (exists && exists?.invoice_number) {
            let val = Number(exists.invoice_number?.split("INV")?.[1]);
            const number = val + 1;
            data.invoice_number = "INV" + number;
        }
       
        const res = await conn.run("INSERT INTO invoices(invoice_number, vendor_id, location_id, created_at) VALUES(?,?,?,datetime('now','localtime'))", [data.invoice_number, data.vendor_id, data.location_id])
            .catch((err) => {
                throw new Error(err)
            });


        const invoiceID = res?.lastID;
        if (invoiceID) {
            if (data.products?.length) {
                let statements = [];
                let errors = [];
                let productsDetails = [];
                const productQuantities = {};
                const ids = data.products.map(pD => {
                    productQuantities[pD.product_id] = pD.scanned_qty;
                    return pD.product_id
                });
                await conn.all(`SELECT id, product_name, available_qty  FROM products WHERE id IN (${ids.join(",")?.toString()?.trim()})`)
                .then((res) => { 
                    if(res.length === data.products.length){
                        productsDetails = res;
                    }else{
                        errors.push(`One or more products is invalid`);
                    }
                })
                .catch(err => {errors.push(err)});
                if(errors.length){
                    await rollbackToSavePoint("BEFORE_INVOICE");
                    throw new Error(errors)
                }
                const productsData =  productsDetails.map((pD,idx) => {
                    const newQty = pD?.available_qty - productQuantities[pD.id?.toString()];
                    let data = {id:null};
                    // check if scanned quantity is available from stock or not
                    if(newQty === undefined || newQty === NaN){
                        errors.push(`${pD?.product_name} Quantity invalid`);
                    }else if(newQty < 0){
                        errors.push(`${pD?.product_name} stock is not available`);
                    } else{
                        data ={
                            id: pD.id,
                            new_qty: newQty
                        }
                    }
                    return data;
                });
                if(errors.length){
                    await rollbackToSavePoint("BEFORE_INVOICE");
                    throw new Error(errors)
                }
                productsData?.length && productsData?.map((pD, idx) => {
                    if (pD?.id) {
                        statements.push(["UPDATE products SET available_qty = ? WHERE id = ?", [pD.new_qty, pD.id]]);
                    }
                });
                const response = await Promise.all(statements.map(async (st, idx) => {
                    let error = false;
                    await conn.run(...st).then((res) => {  return res }).catch((err) => {
                        error = {message:err};
                    });
                    return error;
                }));
                let errIndex = response.findIndex(
                    value => { return typeof value == "object" });
                if(errIndex >= 0){
                    rollbackToSavePoint("BEFORE_INVOICE");
                    throw new Error(response[errIndex].message);
                }
                // console.log("here");
                statements = [];
                data.products.map((product)=>{
                    statements.push(["INSERT INTO invoice_details(invoice_id, product_id, ordered_qty, scanned_qty) VALUES(?,?,?,?) ", [invoiceID, product.product_id, product.ordered_qty, product.scanned_qty]]);
                });
                const insertResponse = await Promise.all(statements.map(async (st, idx) => {
                    let error = false;
                    await conn.run(...st).then((res) => {  return res }).catch((err) => {
                        error = {message:err};
                    });
                    return error;
                }));
                let errIdx = insertResponse.findIndex(
                    value => { return typeof value == "object" });
                if(errIdx >= 0){
                    rollbackToSavePoint("BEFORE_INVOICE");
                    throw new Error(insertResponse[errIdx].message);
                }
                // await rollbackToSavePoint("BEFORE_INVOICE");
         
            } else {
                await rollbackToSavePoint("BEFORE_INVOICE", "At least one product is required");
            }
        }
        else {
            return new Response(JSON.stringify({ status: 500, message: "Error While creating Invoice" }));
        }
        await conn.exec("RELEASE BEFORE_INVOICE")
        return new Response(JSON.stringify({ status: 200, message: "Invoice created successfully" }));
    } catch (err) {
        await conn.exec("RELEASE BEFORE_INVOICE")
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
export const dynamic = 'force-dynamic'
export const dynamicParams = true