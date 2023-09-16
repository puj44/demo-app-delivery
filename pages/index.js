
import axios from 'axios';
import moment from 'moment/moment';
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react'
const Table = dynamic(
  () =>
    import("@/components/Table/Table"),
  { ssr: false }
);
const Card = dynamic(
  () =>
    import("@/components/Card/Card"),
  { ssr: false }
);
export default function Home() {
  const [invoiceData, setInvoiceData] = useState([]);
  const Form = [
    {
        title:"Date",
        field: "date",
        customField: function(row){
          return (
            <span>{moment(new Date(row?.date)).format("DD/MM/YYYY")}</span>
          )
        }
    },
    {
        title:"Invoice Number",
        field:"invoice_number"
    },
    {
        title:"Vendor Name",
        field:"vendor_name"
    },
    {
        title:"Location Name",
        field:"location_name"
    },
    {
        title:"Total Ordered Qty",
        field:"total_ordered_qty"
    },
    {
        title:"Total Scanned Qty",
        field:"total_scanned_qty"
    },
    {
        title:"Total Products",
        field:"total_products"
    },
]
  useEffect(() => {
    axios.get('/api/invoices/list').then((res)=>{
      if(res?.status === 200){
        // setInvoiceData([...res?.data ?? []]);
      }
    }).catch((err)=>{
      toast.error('Error fetching invoices', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    });
  }, [])
  return (
    <div className="col-12 ">
      <div className="d-flex mb-3 pt-3 px-3 justify-content-end header">
        <Link className="primary-button py-1 px-2" href="/create-invoice" style={{fontSize:'14px'}}>Create Invoice</Link>
      </div>
      <div className='px-3'>

        {
          invoiceData?.length > 0 ? invoiceData.map((iD,index)=>{
            return (
              <div key={iD.id ?? index+1} className="my-3">
                <Card  {...iD} />
              </div>
            )
          }):
          <div className="d-flex flex-row justify-content-center ">No Invoices found</div>
        }
      </div>
      
    </div>
  )
}
