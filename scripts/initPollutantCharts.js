import { fetchCSV, fetchJSON } from "./modules/fetchHelpers.js";
import parseCsv from "./modules/parseCsv.js";
import parseBands from "./modules/parseBands.js";
import hourStringToDateObject from "./modules/hourStringToDateObject.js";
import { pollutantChart } from "./modules/charts.js";

const generatePollutantChart = (pollutantWidgetEl, pollutantData, pollutantBandsData, pollutant, unit) => {
    const chartContainer = pollutantWidgetEl.querySelector(".pollutant-widget__chart");
    const chartWidth = chartContainer.offsetWidth;
    const chartHeight = chartContainer.offsetHeight;

    const chartSVG = pollutantChart(pollutantData, pollutantBandsData, {
        height: chartHeight,
        width: chartWidth,
        pollutant,
        unit
    });

    chartSVG.classList.add("pollutant-widget__chart-svg")

    chartContainer.replaceChildren(chartSVG);
}

const bandsData = await fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=bands");

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

for(const pollutantWidgetEl of pollutantWidgetEls) {
    const pollutantWidgetToggleEl = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");
    const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
    const unit = pollutantWidgetEl.getAttribute("data-unit");

    const pollutantDataCSVString = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${pollutant}`);

    const pollutantData = parseCsv(pollutantDataCSVString).map(row => ({ ...row, time: hourStringToDateObject(row.time) }));
    const pollutantBandsData = parseBands(bandsData[`time_${pollutant.replace(".", "")}`]);

    pollutantWidgetToggleEl.addEventListener("click", () => {
        if(window.innerWidth < 800 && pollutantWidgetEl.classList.contains("pollutant-widget--expanded")) {
            generatePollutantChart(pollutantWidgetEl, pollutantData, pollutantBandsData, pollutant, unit);
        }
    });

    pollutantWidgetEl.addEventListener("transitionend", (event) => {
        if(event.propertyName == "height" && pollutantWidgetEl.classList.contains("pollutant-widget--expanded")) {
            generatePollutantChart(pollutantWidgetEl, pollutantData, pollutantBandsData, pollutant, unit);
        }
    });

    window.addEventListener("resize", () => {
        if(pollutantWidgetEl.classList.contains("pollutant-widget--expanded")) {
            generatePollutantChart(pollutantWidgetEl, pollutantData, pollutantBandsData, pollutant, unit);
        }
    });
}