import fetchJSON from "./modules/fetchJSON.js";
import fetchCSV from "./modules/fetchCSV.js";
import parseCsv from "./modules/parseCsv.js";
import parseBands from "./modules/parseBands.js"
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
import { aqiChart }  from "./modules/charts.js";

const generateAqiChart = (aqiData, aqiBandsData, tempData, tempBandsData) => {
    const chartContainer = document.querySelector(".aqi-chart__chart-container");
    const prevChartSvg = document.querySelector(".aqi-chart__chart-svg");
    const chartHeight = window.innerWidth > 600 ? 400 : 300;
    const chartWidth = chartContainer.offsetWidth;

    const chartSVG = aqiChart(aqiData, aqiBandsData, tempData, tempBandsData, {
        height: chartHeight,
        width: chartWidth
    });

    chartSVG.classList.add("aqi-chart__chart-svg");

    prevChartSvg?.remove();
    chartContainer.append(chartSVG);
}

const res = await Promise.all([
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
    fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
    fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=bands")
]);

const [aqiCsv, tempCsv, bandsData] = res;

const aqiData = parseCsv(aqiCsv).map(row => ({ ...row, time: hourStringToDateObject(row.time) }));
const tempData = parseCsv(tempCsv).map(row => ({ ...row, time: hourStringToDateObject(row.time) }));
const aqiBandsData = parseBands(bandsData.time_AQI);
const tempBandsData = parseBands(bandsData.time_T);

generateAqiChart(aqiData, aqiBandsData, tempData, tempBandsData);

window.addEventListener('resize', () => {
    generateAqiChart(aqiData, aqiBandsData, tempData, tempBandsData);
});