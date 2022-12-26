import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function getPollutantDataFromCSV(csvString) {
    const pollutantData = [];
    const rows = d3.csvParseRows(csvString, d3.autoType);

    rows.forEach(([time, value]) => pollutantData.push({ time, value }));

    return pollutantData;
};

export default getPollutantDataFromCSV;