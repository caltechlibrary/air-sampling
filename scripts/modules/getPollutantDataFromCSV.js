import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function getPollutantDataFromCSV(csvString) {
    let pollutantData = {};
    let rows = d3.csvParse(csvString, d3.autoType);
    let timeField = rows.columns[0];

    for(let pollutant of rows.columns) {
        if(pollutant != timeField) {
            pollutantData[pollutant] = { unit: rows[0][pollutant], data: [] };
        }
    }

    for(let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let time = row[timeField] * 1000;
        for(let pollutant in row) {
            if(pollutant != timeField) {
                pollutantData[pollutant].data.push({ time, value: row[pollutant] });
            }
        }
    }

    return pollutantData;
};

export default getPollutantDataFromCSV;