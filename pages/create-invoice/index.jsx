

import { searchDebounce } from '@/components/common/debounce';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const SearchableSelect = dynamic(
  () =>
    import("@/components/SearchableSelect/SearchableSelect"),
  { ssr: false }
);
const QrScan = dynamic(
  () =>
    import("@/components/QrScan/QrScan"),
  { ssr: false }
);
const Table = dynamic(
  () =>
    import("@/components/Table/Table"),
  { ssr: false }
);
import React, { useEffect, useState } from 'react'

const vendorField = {
  fieldName: "vendor_id",
  label: "vendor_name",
  value:"id"
}
const loationField = {
  fieldName: "location_id",
  label: "name",
  value:"id",
  customField:(val)=>{
    return (
      <div className="d-flex flex-column">
        <div className="fw-bolder" style={{fontSize:"14px"}}>
            {val?.name}
        </div>
        <div className="text-muted" style={{fontSize:'12px'}}>
            {val?.address}
        </div>
      </div>
    )
  }
}
const CreateInvoice = () => {
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [invoiceData, setInvoiceData] = useState({});
  const [isCheckValid, setIsCheckValid] = useState(false);
  const [show,setShow] = useState(false);
  const [log, setLog] = useState(false);
  const tableForm = [
    {
      title:"Product Name",
      field:"product_name"
    },
    {
      title:"Ordered Qty",
      field:"ordered_qty",
      customField:(val,field,idx)=>{
        return(
          <input
            onChange={(e)=>{onChangeSearch(e.target.value,field,idx)}}
            value={val?.ordered_qty ??""}
            defaultValue={""}
            type='number'
            style={{border:"0px", outline:"0px"}}
          />
        )
      }
    },
    {
      title:"Scanned Qty",
      field:"scanned_qty",
      customClass:"text-end"  
    },
    {
      title:"Available Qty",
      field:"available_qty",
      customClass:"text-end"
    },
  ]
  useEffect(()=>{

  },[]);
  const getVendorSearch = async(val) =>{
    await axios.get(`/api/vendors?search=${val??""}`).then((res)=>{
      if(res?.status === 200){
        setVendors([...res?.data ?? []]);
      }
    }).catch((err)=>{
      toast.error('Error fetching vendors', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    });
  }
  const getVendorLocations = async(val) =>{
    await axios.get(`/api/locations/${val??""}`).then((res)=>{
      if(res?.status === 200){
        setLocations([...res?.data ?? []]);
      }
    }).catch((err)=>{
      toast.error('Error fetching locations', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    });
  }
  const onChangeSearch = (val, field,idx) =>{
    if(field?.fieldName === "vendor_id"){
      getVendorSearch(val)
    }
    if(idx >= 0){
      let products = invoiceData?.products;
      products[idx][field?.field] = val;
      setInvoiceData({...invoiceData, products: products})
    }
  }
  const onSearchSelect = (val,field) =>{
    if(field?.fieldName === "vendor_id"){
      getVendorLocations(val.id);
    }
    setInvoiceData({...invoiceData, [field?.fieldName]:val})
  }
  const getConfigData = () =>{
    let data = {};
    data.vendor_id = vendors ?? [];
    data.location_id = locations ?? [];
    return data;
  }

  const handleScan = (text,result) =>{
    if(res !== null){
      // setShow(false);
    }
    console.log("asdasd",text,result);
    setLog("result:",(text+result)?.toString()?.trim());
  }
  const handleError = (err) =>{
    console.log("err",err);
    setLog("err:",(err)?.toString()?.trim());
    // setShow(false);
  }
  const onAddProduct = async(id) =>{
    await axios.get(`/api/products/${id??""}`).then((res)=>{
      if(res?.status === 200){
        let products = invoiceData?.products ?? [];
        let productExists = false;
        products?.length && products.filter((pD,idx)=>{
          if(pD?.id === res?.data?.id){
            productExists = idx;
          }
        });
        console.log("exists",productExists);
        if(productExists === false){
          products.push({
            ...res?.data, scanned_qty:1
          });
        }else{
          products[productExists] = {...products[productExists], scanned_qty:products[productExists].scanned_qty+1};
        };
        setInvoiceData({...invoiceData, products:products});
      }
    }).catch((err)=>{
      toast.error('Error fetching product', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    });
  }
  return (
    <div className="col-12 px-3 my-4" style={{height:"100vh"}}>
      <div className="d-flex mb-2 justify-content-end">
        <Link className="primary-button py-1 px-3" href="/" style={{fontSize:'14px'}}>Go Back</Link>
      </div>
      <div className="d-flex flex-column w-100">
        <div>
          <SearchableSelect
            title={"Select vendor"}
            configData={getConfigData()}
            field={vendorField}
            data={invoiceData}
            onChangeSearch={searchDebounce(onChangeSearch)}
            onSearchSelect={onSearchSelect}
            isCheckValid={isCheckValid}
          />
        </div>
      </div>
      <div className="d-flex flex-column my-2 w-100">
        <div>
          <SearchableSelect
            title={"Select location"}
            configData={getConfigData()}
            field={loationField}
            data={invoiceData}
            onChangeSearch={searchDebounce(onChangeSearch)}
            onSearchSelect={onSearchSelect}
            isCheckValid={isCheckValid}
          />
        </div>
      
      </div>
      <div className="mt-4 d-flex flex-row justify-content-end">
        <button className="primary-button py-1 px-3 " onClick={()=>{setShow(true);}}>Add Product</button>
      </div>
      <div className="d-flex flex-row mt-4">{log}</div>
      <div className="mt-3 custom-table">
          <Table 
            tableData={invoiceData?.products ?? []}
            formData={tableForm}
          />
      </div>
      {show &&
      <QrScan 
        show={show}
        fps={30}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={handleScan}
        qrCodeErrorCallback={handleError}
      />}
    </div>
  )
}
export default CreateInvoice;
