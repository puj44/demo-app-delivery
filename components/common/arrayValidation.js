const arrayValidator = async (data, fields) => {
    let messages = [];
    if (data?.length) {
        data.filter((d, idx) => {
            fields?.map((fD, i) => {
                if (!d?.[fD.field]) {
                    messages.push(`${fD.title + "." + (idx)} is required`);
                } else if (typeof d?.[fD.field] !== fD?.type) {
                    messages.push(`${fD.title + "." + (idx)} must be ${fD?.type}`);
                }
            })
        })
    }
    return messages;
}
export default arrayValidator;