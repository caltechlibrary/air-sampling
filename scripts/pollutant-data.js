import fetchJSON from "./modules/fetchJSON.js";
import fetchCSV from "./modules/fetchCSV.js";
import parseCsv from "./modules/parseCsv.js";
import parseBands from "./modules/parseBands.js";
import aggreageData from "./modules/aggregateData.js";
import createDataTable from "./modules/createDataTable.js";

const DATA_LABELS = {
    time: "Time",
    pollutantData: "Value",
    pollutantDataLower: "Lower",
    pollutantDataUpper: "Upper",
};

const formula = document.documentElement.getAttribute("data-formula");
const main = document.querySelector("main");

const pollutantCsv = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${formula}`);
const bandsData = await fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=bands");

const pollutantData = parseCsv(pollutantCsv);
const pollutantBandsData = parseBands(bandsData[`time_${formula.replace(".", "")}`]);
const pollutantDataLower = pollutantBandsData.map(entry => ({ time: entry.time, value: entry.lower }));
const pollutantDataUpper = pollutantBandsData.map(entry => ({ time: entry.time, value: entry.upper }));

const dataAggregated = aggreageData({
    pollutantData,
    pollutantDataLower,
    pollutantDataUpper
});


const table = createDataTable(dataAggregated, DATA_LABELS);

main.appendChild(table);