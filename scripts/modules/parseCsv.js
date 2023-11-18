import parseTime from "./parseTime.js";

function parseCsv(csv) {
    const parsedCsv = [];

    const rows = csv.trim().split("\n");

    for(const row of rows) {
        const [time, value] = row.split(",");

        parsedCsv.push({
            time: parseTime(time),
            value: parseFloat(value)
        })
    }

    return parsedCsv;
};

export default parseCsv;