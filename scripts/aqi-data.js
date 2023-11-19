import fetchJSON from "./modules/fetchJSON.js";
import fetchCSV from "./modules/fetchCSV.js";
import parseCsv from "./modules/parseCsv.js";
import parseBands from "./modules/parseBands.js"
import aggreageData from "./modules/aggregateData.js"
import createDataTable from "./modules/createDataTable.js";

const DATA_LABELS = {
    time: "Time",
    aqiData: "AQI",
    aqiDataLower: "AQI Lower",
    aqiDataUpper: "AQI Upper",
    tempData: "Temperature",
    tempDataLower: "Temp Lower",
    tempDataUpper: "Temp Upper"
}

const main = document.querySelector("main");

let res;

res = await Promise.all([
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
    fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=bands")
]);

const [aqiCsv, tempCsv, bandsData] = res;

const aqiData = parseCsv(aqiCsv);
const tempData = parseCsv(tempCsv);
const aqiBandsData = parseBands(bandsData.time_AQI);
const tempBandsData = parseBands(bandsData.time_T);

const aqiDataLower = aqiBandsData.map(entry => ({ time: entry.time, value: entry.lower }));
const aqiDataUpper = aqiBandsData.map(entry => ({ time: entry.time, value: entry.upper }));
const tempDataLower = tempBandsData.map(entry => ({ time: entry.time, value: entry.lower }));
const tempDataUpper = tempBandsData.map(entry => ({ time: entry.time, value: entry.upper }));

const dataAggregated = aggreageData({
    aqiData,
    aqiDataLower,
    aqiDataUpper,
    tempData,
    tempDataLower,
    tempDataUpper,
})

const table = createDataTable(dataAggregated, DATA_LABELS);

main.appendChild(table);