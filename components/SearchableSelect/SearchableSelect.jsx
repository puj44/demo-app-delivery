import React, { useEffect } from 'react'
import Select from 'react-select';
const SearchableSelect =({
    field,
    configData,
    data,
    onChangeSearch,
    onSearchSelect,
    title,
    isCheckValid
}) => {
  return (
    <>
        <div className="pb-1">
            {title}
        </div>
        <Select
            options={configData?.[field.fieldName]??[]}
            getOptionLabel={(option)=>
                field?.label ? option[field?.label] ?? '': option
            }
            getOptionValue={(option)=>
                field?.value ? option[field?.value] ?? "": option
            }
            value={data?.[field.fieldName]??""}
            onInputChange={(e)=>{
                onChangeSearch && onChangeSearch(e,field);
            }}
            onChange={(e)=>{
                onSearchSelect && onSearchSelect(e, field)
            }}
            noOptionsText="No data"
            formatOptionLabel={(option) => {
                return field?.customField
                ? field?.customField(option, field)
                : field.label
                ? option[field.label]
                : option
            }}
        />
          {
            (isCheckValid && !data?.[field.fieldName]?.[field.value]) &&
            <div className="pt-1" style={{color:"#d52020", fontSize:"12px"}}>
              This field is required
            </div>
          }
    </>
  )
}

export default SearchableSelect