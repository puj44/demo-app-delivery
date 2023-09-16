import React from 'react'
import moment from 'moment/moment';
const Card = ({date, invoice_number, total_ordered_qty, total_products, location_name, vendor_name, total_scanned_qty}) => {
  return (
    <div className="card rounded py-2" style={{background:"rgb(234 237 247)", border:"0px", boxShadow:"rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px"}}>
        <div className="px-3 pb-2 fw-bolder d-flex flex-row align-content-center" style={{fontSize:"16px", borderBottom:"1px solid rgb(78, 109, 219)",boxShadow:"rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px"}}>
            <div className="d-flex  justify-content-start w-100" style={{color:"rgb(78, 109, 219)"}}>
                {invoice_number}
            </div>
            <div className="d-flex  justify-content-end">
                {moment(new Date(date)).format("DD/MM/YYYY")}
            </div>
        </div>
        <div className="mt-3 card-content pb-2">
            <div className="px-3 col-12 row mx-0 px-0">
                <div className="col-6 row mx-0 px-0">
                    {vendor_name}
                </div>
                <div className="col-6 text-end px-0">
                    {location_name}
                </div>
            </div>
            <div style={{ borderBottom:"1px solid rgb(78, 109, 219)"}} className="py-2"></div>
            <div className="d-flex flex-column mt-3 px-3">
                <div className="total-section">
                    <span className="fw-bolder">Products: </span>{total_products}
                </div>
                <div className="total-section">
                    <span className="fw-bolder">Ordered Quantities: </span>{total_ordered_qty ?? 0}
                </div>
                <div className="total-section">
                    <span className="fw-bolder">Scanned Quantities: </span>{total_scanned_qty ?? 0}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Card