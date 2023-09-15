import SearchableSelect from '@/components/SearchableSelect/SearchableSelect';
import { searchDebounce } from '@/components/common/debounce';
import axios from 'axios';
import Link from 'next/link';
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
  const onChangeSearch = (val, field) =>{
    if(field?.fieldName === "vendor_id"){
      getVendorSearch(val)
    }
  }
  const onSearchSelect = (val,field) =>{
    if(field?.fieldName === "vendor_id"){
      getVendorLocations(val.id);
    }
    setInvoiceData({...invoiceData, [field?.fieldName]:val})
  }
  console.log("dataInv",invoiceData);
  const getConfigData = () =>{
    let data = {};
    data.vendor_id = vendors ?? [];
    data.location_id = locations ?? [];
    return data;
  }
  return (
    <div className="col-12 px-3 my-4" style={{height:"100vh"}}>
      <div className="d-flex mb-2 justify-content-end">
        <Link className="primary-button py-1 px-3" href="/" style={{fontSize:'14px'}}>Go Back</Link>
      </div>
        <div className="d-flex flex-column w-100">
          <div className="pb-1">
            Select vendor
          </div>
          <div>
            <SearchableSelect
              configData={getConfigData()}
              field={vendorField}
              data={invoiceData}
              onChangeSearch={searchDebounce(onChangeSearch)}
              onSearchSelect={onSearchSelect}
            />
          </div>
        </div>
        <div className="d-flex flex-column my-2 w-100">
          <div className="pb-1">
            Select location
          </div>
          <div>
            <SearchableSelect
              configData={getConfigData()}
              field={loationField}
              data={invoiceData}
              onChangeSearch={searchDebounce(onChangeSearch)}
              onSearchSelect={onSearchSelect}
            />
          </div>
        </div>
    </div>
  )
}
export default CreateInvoice;
