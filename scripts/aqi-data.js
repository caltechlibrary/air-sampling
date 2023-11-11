import { fetchCSV, fetchJSON } from "./modules/fetchHelpers.js";
import parseCsv from "./modules/parseCsv.js";
import parseBands from "./modules/parseBands.js"
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
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
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
        fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=bands")
    ]);
}

const [aqiCsv, tempCsv, bandsData] = res;

const aqiData = parseCsv(aqiCsv).map(row => ({ ...row, time: hourStringToDateObject(row.time) }));
const tempData = parseCsv(tempCsv).map(row => ({ ...row, time: hourStringToDateObject(row.time) }));
const aqiBandsData = parseBands(bandsData.time_AQI).map(entry => ({ ...entry, time: new Date(entry.time), }));
const tempBandsData = parseBands(bandsData.time_T).map(entry => ({ ...entry, time: new Date(entry.time), }));
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