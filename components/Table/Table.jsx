
const Table = ({tableData, formData}) =>{
    return(
        <>
        <table>
            <thead className="px-2">
            {
                formData?.length && formData?.map((d,i)=>{
                    return(
                        <th className="py-2" key={d.field}>{d.title}</th>
                    )
                })
            }
            </thead>
            <tbody>
            {
                tableData?.length > 0 &&
                    tableData?.map((rowValue,idx)=>{
                        return(
                            <tr key={idx}>
                                {formData?.length && formData?.map((fD,i)=>{
                                    return(
                                        <td className="py-2 pe-1" key={fD.field+idx+i}>{fD?.customField ? fD?.customField(rowValue,fD,idx,tableData):rowValue?.[fD?.field]}</td>
                                    )
                                })}
                            </tr>
                        )
                    })
                
            }
            </tbody>
        </table>
        {formData?.length > 0 &&
            tableData?.length <= 0 ? (
            <div
            className="row d-flex text-center justify-content-center align-items-center  p-4 pb-5 mb-3 mx-1"
            style={{ fontSize: "0.85rem", overflowX:"auto" }}
            >
                No Data
            </div>
        ) : (
            ""
        )}
        </>
    )
}

export default Table;
