import { fetchCSV } from "./modules/fetchHelpers.js";
import parseTimeValueCSV from "./modules/parseTimeValueCSV.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
import { aqiChart }  from "./modules/charts.js";

const generateAqiChart = (aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper) => {
    const chartContainer = document.querySelector(".aqi-chart");
    const chartWidth = chartContainer.offsetWidth

    const chartSVG = aqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper, {
        height: 400,
        width: chartWidth
    });

    chartSVG.classList.add("aqi-chart__svg");

    chartContainer.replaceChildren(chartSVG);
}

const res = await Promise.all([
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_lower"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi_upper"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_lower"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp_upper")
]);

const csvData = res.map(parseTimeValueCSV);

const csvDataTimeFormatted = csvData.map(data => {
    return data.map(entry => ({ ...entry, time: hourStringToDateObject(entry.time) }))
});

const [aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper] = csvDataTimeFormatted;

generateAqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper)

window.addEventListener('resize', () => {
    generateAqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper)
})