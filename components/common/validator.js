const validator = async (data, fields) => {
    let messages = [];
    if (fields?.length) {
        fields.map((d) => {
            const key = Object.keys(d)[0];
            if (!data[key]) {
                messages.push(`${d[key]} is required.`);
            } else {
                if (d.type) {
                    if (d.type === "array") {
                        if (!Array.isArray(data[key])) {
                            messages.push(`${d[key]} must be of type ${d.type}`);
                        }
                    }
                    else if (typeof data[key] !== data.type) {
                        messages.push(`${d[key]} must be of type ${d.type}`);
                    }
                }
            }
        })
    }
    return messages;
}
export default validator;