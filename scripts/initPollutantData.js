import { fetchCSV } from "./modules/fetchHelpers.js";
import parseCsv from "./modules/parseCsv.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
import createDataTable from "./modules/createDataTable.js";

const DATA_LABELS = {
    time: "Time",
    value: "Value"
};

const formula = document.documentElement.getAttribute("data-formula");
const main = document.querySelector("main");

const pollutantDataCSVString = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${formula}`);
const pollutantData = parseCsv(pollutantDataCSVString);
const pollutantDataFormatted = pollutantData.map(datum => ({ ...datum, time: hourStringToDateObject(datum.time) }));

const table = createDataTable(pollutantDataFormatted, DATA_LABELS);

main.appendChild(table);