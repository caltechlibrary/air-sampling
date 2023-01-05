import { fetchCSV } from "./modules/fetchHelpers.js";
import getPollutantDataFromCSV from "./modules/getPollutantDataFromCSV.js";
import timeElementToDate from "./modules/timeElementToDate.js";
import aqiChart from "./modules/aqiChart.js";

// const csvData = await Promise.all([
//     fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi`),
//     fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp`)
// ]);

// const [aqiData, tempData] = csvData
//     .map(csvString => getPollutantDataFromCSV(csvString))
//     .map(csvData => csvData.map(csvEntry => ({ ...csvEntry, time: timeElementToDate(csvEntry.time) })));

const aqiData = [
    { time : new Date().setHours(0,0,0,0), value: 10 },
    { time : new Date().setHours(14,0,0,0), value: 90 }
];

const tempData = [
    { time : new Date().setHours(0,0,0,0), value: 20 },
    { time : new Date().setHours(14,0,0,0), value: 35 }
];

const chartSVG = aqiChart(aqiData, tempData);
const chartContainer = document.querySelector(".aqi-chart");

chartSVG.classList.add("aqi-chart__svg");

chartContainer.append(chartSVG);