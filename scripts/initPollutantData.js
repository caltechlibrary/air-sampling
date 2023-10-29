import { fetchCSV } from "./modules/fetchHelpers.js";
import parseTimeValueCSV from "./modules/parseTimeValueCSV.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";

const DATA_LABELS = {
    time: "Time",
    value: "Value"
};

const formula = document.documentElement.getAttribute("data-formula");

const pollutantDataCSVString = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${formula}`);
const pollutantData = parseTimeValueCSV(pollutantDataCSVString);
const pollutantDataFormatted = pollutantData.map(datum => ({ ...datum, time: hourStringToDateObject(datum.time) }));

let table = document.querySelector(".data-table")

let tableHeader = document.createElement("tr")
let tableBody = new DocumentFragment()
let tableColumns = [];

for(let prop in pollutantDataFormatted[0]) { tableColumns.push(prop) }

// Create table header
tableColumns.forEach(column => {
    let tableHeaderCell = document.createElement("th");
    tableHeaderCell.classList.add("data-table__cell", "data-table__cell--header")

    tableHeaderCell.setAttribute("scope", "col");
    tableHeaderCell.innerText = DATA_LABELS[column];
    
    tableHeader.appendChild(tableHeaderCell);
});

// Create table body
pollutantDataFormatted.forEach(datum => {
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