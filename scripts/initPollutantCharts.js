import { fetchCSV } from "./modules/fetchHelpers.js";
import parseTimeValueCSV from "./modules/parseTimeValueCSV.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
import pollutantChart from "./modules/pollutantChart.js";

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

for(const pollutantWidgetEl of pollutantWidgetEls) {
    const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
    const unit = pollutantWidgetEl.getAttribute("data-unit");
    const chartContainer = pollutantWidgetEl.querySelector(".pollutant-widget__chart-container");

    const pollutantDataCSVString = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${pollutant}`);
    const pollutantData = parseTimeValueCSV(pollutantDataCSVString);
    const pollutantDataFormatted = pollutantData.map(datum => ({ ...datum, time: hourStringToDateObject(datum.time) }));

    const chartSvg = pollutantChart(pollutantDataFormatted, { pollutant, unit });
    chartSvg.classList.add("pollutant-widget__chart");

    chartContainer.append(chartSvg);
}