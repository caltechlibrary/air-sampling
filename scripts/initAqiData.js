import { fetchCSV } from "./modules/fetchHelpers.js";
import parseTimeValueCSV from "./modules/parseTimeValueCSV.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";

const DATA_LABELS = {
    time: "Time",
    aqiData: "AQI",
    aqiDataLower: "AQI Lower",
    aqiDataUpper: "AQI Upper",
    tempData: "Temperature",
    tempDataLower: "Temp Lower",
    tempDataUpper: "Temp Upper"
}

const dummy = document.documentElement.hasAttribute("data-dummy")

let res;

if (dummy) {
    res = await Promise.all([
        fetchCSV("dummy/aqi.csv"),
        fetchCSV("dummy/aqi_lower.csv"),
        fetchCSV("dummy/aqi_upper.csv"),
        fetchCSV("dummy/temp.csv"),
        fetchCSV("dummy/temp_lower.csv"),
        fetchCSV("dummy/temp_upper.csv")
    ]);
} else {
    res = await Promise.all([
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_lower"),
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_upper"),
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_lower"),
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_upper")
    ]);
}

const csvData = res.map(parseTimeValueCSV);

const csvDataTimeFormatted = csvData.map(data => {
    return data.map(entry => ({ ...entry, time: hourStringToDateObject(entry.time) }));
});

const [aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper] = csvDataTimeFormatted;

const csvDataAggregated = aqiData.map((aqiDatum, i) => (
    {
        time: aqiDatum.time,
        aqiData: aqiData[i].value,
        aqiDataLower: aqiDataLower[i].value,
        aqiDataUpper: aqiDataUpper[i].value,
        tempData: tempData[i].value,
        tempDataLower: tempDataLower[i].value,
        tempDataUpper: tempDataUpper[i].value
    }
)).sort((a, b) => a.time - b.time);

let table = document.querySelector(".data-table")

let tableHeader = document.createElement("tr")
let tableBody = new DocumentFragment()
let tableColumns = [];

for(let prop in csvDataAggregated[0]) { tableColumns.push(prop) }

// Create table header
tableColumns.forEach(column => {
    let tableHeaderCell = document.createElement("th");
    tableHeaderCell.classList.add("data-table__cell", "data-table__cell--header")

    tableHeaderCell.setAttribute("scope", "col");
    tableHeaderCell.innerText = DATA_LABELS[column];
    
    tableHeader.appendChild(tableHeaderCell);
});

// Create table body
csvDataAggregated.forEach(datum => {
    let row = document.createElement("tr");
    tableColumns.forEach(column => {
        let cell = document.createElement("td")
        cell.classList.add("data-table__cell")

        let content = datum[column]

        cell.innerText = column == "time" ? cell.innerText = content.toLocaleTimeString() : content

        row.appendChild(cell)
    });
    tableBody.appendChild(row)
})

table.appendChild(tableHeader);
table.appendChild(tableBody);