import { fetchCSV } from "./modules/fetchHelpers.js";
import getPollutantDataFromCSV from "./modules/getPollutantDataFromCSV.js";
import timeElementToDate from "./modules/timeElementToDate.js";
import aqiChart from "./modules/aqiChart.js";

const res = await Promise.all([
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_lower"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_upper"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_lower"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_upper")
]);

const csvData = res.map(getPollutantDataFromCSV);

const csvDataTimeFormatted = csvData.map(data => {
    return data.map(entry => ({ ...entry, time: timeElementToDate(entry.time) }))
});

const [aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper] = csvDataTimeFormatted;

const chartSVG = aqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper);
const chartContainer = document.querySelector(".aqi-chart");

chartSVG.classList.add("aqi-chart__svg");

chartContainer.append(chartSVG);