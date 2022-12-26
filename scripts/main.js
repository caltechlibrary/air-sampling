import { fetchCSV } from "./modules/fetchHelpers.js";
import getPollutantDataFromCSV from "./modules/getPollutantDataFromCSV.js";
import timeElementToDate from "./modules/timeElementToDate.js";
import pollutantChart from "./modules/pollutantChart.js";

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

for(let pollutantWidgetEl of pollutantWidgetEls) {
    const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
    const unit = pollutantWidgetEl.getAttribute("data-unit");
    const chartContainer = pollutantWidgetEl.querySelector(".pollutant-widget__chart-container");

    const pollutantDataCSVString = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${pollutant}`);
    const pollutantData = getPollutantDataFromCSV(pollutantDataCSVString);
    const pollutantDataFormatted = pollutantData.map(datum => ({ ...datum, time: timeElementToDate(datum.time) }));

    const chartSvg = pollutantChart(pollutantDataFormatted, { pollutant, unit });
    chartSvg.classList.add("pollutant-widget__chart");

    chartContainer.append(chartSvg);
}