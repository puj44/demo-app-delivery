

import { searchDebounce } from '@/components/common/debounce';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
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
import { useRouter } from 'next/router';
import Image from 'next/image';
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
  const router = useRouter();
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
    {
      title:"",
      field:"remove",
      customField:(val,field,idx,data) =>{
        return (
          <Image
            src={"/remove.png"}
            width={24}
            height={24}
            alt="delete"
            style={{background:"transparent"}}
            className="cursor-pointer"
            onClick={()=>{
              removeLine(data,idx)
            }}
          />
        )
      }
    }
  ]
  const removeLine = (data,idx) =>{
    let tableData = data;
    delete tableData[idx];
    setInvoiceData({...invoiceData, products:tableData})
  }
  const showErrors = (msgs) => {
    if(Array.isArray(msgs)){
      const errEle = msgs.map((msg) => (
        <li key={msg}>{msg}</li>
      ));
      toast.error(<>{errEle}</>, {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }else{
      toast.error(msgs, {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  }
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
  const onAddProduct = async(code) =>{
    await axios.get(`/api/products/code/${code??""}`).then((res)=>{
      if(res?.status === 200){
        let products = invoiceData?.products ?? [];
        let productExists = false;
        products?.length && products.filter((pD,idx)=>{
          if(pD?.id === res?.data?.id){
            productExists = idx;
          }
        });
        if(productExists === false){
          products.push({
            ...res?.data, scanned_qty:1
          });
          toast.success('Product added successfully', {
            position: toast.POSITION.BOTTOM_RIGHT
          });
        }else{
          products[productExists] = {...products[productExists], scanned_qty:products[productExists].scanned_qty+1};
          toast.success(`${products[productExists]?.product_name} scanned quantity updated`, {
            position: toast.POSITION.BOTTOM_RIGHT
          });
        };

        setInvoiceData({...invoiceData, products:products});
      }
    }).catch((err)=>{
      toast.error('Error fetching product', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    });
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
  const handleClose = () =>{
    setShow(false);
  }
  const handleScan = async(decodedText, decodedResult) =>{
    if(decodedText !== null){
      if(typeof decodedText === "string"){
        await onAddProduct(decodedText?.toString()?.trim());

        setShow(false);
      }
      else{
        toast.error('Invalid QR Code', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        setShow(false);
      }
    
    }
  }
  const handleError = (err) =>{
    // setShow(false);
  }
  const handleSubmit = async() =>{
    setIsCheckValid(true);
    if(invoiceData?.vendor_id?.id && invoiceData?.location_id?.id){
      let errMessages = [];
      invoiceData?.products?.map((product,idx)=>{
        if(!product.ordered_qty || product.ordered_qty === ""){
          errMessages.push(`${product.product_name} ordered qty is required`);
        } else if(parseInt(product.scanned_qty) > parseInt(product.ordered_qty)){
          errMessages.push(`${product.product_name} scanned quantity qty can't be more than ordered qty`);
        }
        if(parseInt(product.scanned_qty) > parseInt(product.available_qty)){
          errMessages.push(`${product.product_name} stock might not be available, please retry`);
        }
      });
      if(errMessages?.length > 0){
        showErrors(errMessages);
      }else{
        let data = JSON.parse(JSON.stringify(invoiceData));
        let products = data.products.map((pD)=>{
          let obj = pD;
          obj.product_id = pD.id;
          obj.ordered_qty = parseInt(obj.ordered_qty)
          delete obj.id;
          return obj;

        });
        data.vendor_id = data.vendor_id.id;
        data.location_id = data.location_id.id;
        data.products = products;
        await axios.post("/api/invoices",data).then((res)=>{
          if(res?.data?.status === 200){
              toast.success('Invoice created successfully', {
                position: toast.POSITION.BOTTOM_RIGHT
              });
              router.push("/")
          }else{
            showErrors(res?.data?.message);
          }
        })
      }
    }
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
        qrbox={{width:250,height:250}}
        disableFlip={false}
        qrCodeSuccessCallback={(decodedText,decodedResult)=>{handleScan(decodedText,decodedResult)}}
        qrCodeErrorCallback={(err)=>{handleError(err)}}
        rememberLastUsedCamera={true}
        handleClose={handleClose}
      />}
      <div className="mt-3 d-flex flex-row justify-content-center">
        <button className="primary-button py-1 px-4 " disabled={invoiceData?.products && invoiceData?.products?.length > 0 ? false:true} onClick={()=>{handleSubmit()}} style={{fontSize:'14px'}}>Submit</button>
      </div>
    </div>
  )
}
export default CreateInvoice;
