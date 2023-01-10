import { fetchCSV } from "./modules/fetchHelpers.js";
import getPollutantDataFromCSV from "./modules/getPollutantDataFromCSV.js";
import timeElementToDate from "./modules/timeElementToDate.js";
import aqiChart from "./modules/aqiChart.js";

import { aqiDataLower, aqiDataUpper, tempDataLower, tempDataUpper } from "./modules/dummyAQIData.js";

const csvData = await Promise.all([
    fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi`),
    fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp`)
]);

const [aqiData, tempData] = csvData
    .map(csvString => getPollutantDataFromCSV(csvString))
    .map(csvData => csvData.map(csvEntry => ({ ...csvEntry, time: timeElementToDate(csvEntry.time) })));

const chartSVG = aqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper);
const chartContainer = document.querySelector(".aqi-chart");

chartSVG.classList.add("aqi-chart__svg");

chartContainer.append(chartSVG);