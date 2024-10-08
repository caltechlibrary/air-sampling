import fetchJSON from "./modules/fetchJSON.js";
import fetchCSV from "./modules/fetchCSV.js";
import parseCsv from "./modules/parseCsv.js";
import parseBands from "./modules/parseBands.js";
import { aqiChart, pollutantChart } from "./modules/charts.js";

function getCondition(aqi) {
    let condition;

    if (aqi <= 50) {
        condition = "good";
    } else if (aqi <= 100) {
        condition = "moderate";
    } else if (aqi <= 150) {
        condition = "unhealthy-for-sensitive-groups";
    } else if (aqi <= 200) {
        condition = "unhealthy";
    } else if (aqi <= 300) {
        condition = "very-unhealthy";
    } else {
        condition = "hazardous"
    }

    return condition;
}

function formatCondition(condition) {
    const words = condition.split("-");
    const wordsCapitalized = [];

    for (const word of words) {
        wordsCapitalized.push(word.charAt(0).toUpperCase() + word.substring(1));
    }

    return wordsCapitalized.join(" ");
}

function onResize() {
    const resourceWidgetEl = document.querySelector(".resources-widget");
    const resourceWidgetContainerEl = resourceWidgetEl.parentElement;
    const layoutBreakpoint = 1100;

    const shiftToDesktop = window.innerWidth >= layoutBreakpoint && resourceWidgetContainerEl.classList.contains("page__resources-widget-container");
    const shiftToMobile = window.innerWidth < layoutBreakpoint && resourceWidgetContainerEl.classList.contains("top-container__item");

    if (shiftToDesktop) {
        const topContainerEl = document.querySelector(".top-container");
        resourceWidgetContainerEl.classList.remove("page__resources-widget-container");
        resourceWidgetContainerEl.classList.add("top-container__item");
        topContainerEl.appendChild(resourceWidgetContainerEl);
    } else if (shiftToMobile) {
        const mainContainerEl = document.querySelector("main");
        resourceWidgetContainerEl.classList.remove("top-container__item");
        resourceWidgetContainerEl.classList.add("page__resources-widget-container");
        mainContainerEl.appendChild(resourceWidgetContainerEl);
    }
}

async function initCurrentValues() {
    const aqiWidgetEl = document.querySelector(".aqi-widget");
    const valueEl = document.querySelector(".aqi-widget__value");
    const primaryPollutantEl = document.querySelector(".aqi-widget__primary-pollutant-value")

    try {
        const data = await fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air");

        // Init header
        const dateEl = document.querySelector(".header__date");
        const date = new Date(data.time * 1000);
        const time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
        const day = date.toLocaleDateString("en-US", { dateStyle: "medium" });
        dateEl.textContent = `${day} ${time}`;

        // Init aqi widget
        const descriptionEl = document.querySelector(".aqi-widget__condition-value");
        const aqiMeterEl = document.querySelector(".aqi-widget__meter");
        const inidicatorEl = document.getElementById("aqi-widget__meter-indicator");

        if (!(isNaN(data.aqi) || data.aqi === null || data.aqi === undefined)){
            const condition = getCondition(data.aqi);
            const conditionFormatted = formatCondition(condition);

            aqiWidgetEl.classList.add(`aqi-widget--${condition}`);
            valueEl.textContent = data.aqi;
            let pollutant = data.AQI_30_PRI;

            let formattedPollutant = pollutant.replace(/(\d+(\.\d+)?)/g, '<sub>$1</sub>');

            primaryPollutantEl.innerHTML = formattedPollutant;
            descriptionEl.textContent = conditionFormatted;
            aqiMeterEl.setAttribute("aria-label", `Current AQI value falls within the "${condition}" category.`);
            inidicatorEl.setAttribute("x", `${(data.aqi / 500) * 100}%`);

            aqiWidgetEl.classList.add("aqi-widget--initialized");
        } else {
            aqiWidgetEl.classList.add(`aqi-widget--not-available`);
            valueEl.textContent = "N/A";
            primaryPollutantEl.textContent = "N/A";
        }



        // Init pollutant widgets
        const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

        for (const pollutantWidgetEl of pollutantWidgetEls) {
            const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
            const concentration = data[pollutant];
            const aqi = data[`${pollutant}_aqi`];

            if (aqi !== undefined && aqi !== null && !isNaN(aqi)) {
                const aqiLabelEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi-label");
                const aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");

                const condition = getCondition(aqi);
                const warningText = pollutantWidgetEl.getAttribute(`data-${condition}`);

                pollutantWidgetEl.classList.add(`pollutant-widget--${condition}`);
                aqiEl.textContent = aqi;
                aqiLabelEl.classList.add("pollutant-widget__aqi-label--initialized");

                if (warningText) {
                    const warningTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__warning-text");

                    warningTextEl.textContent = warningText;
                }
            }

            if (concentration !== undefined && concentration !== null && !isNaN(concentration)) {
                const concentrationLabelEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration-label");
                const concentrationEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration-text");

                concentrationEl.textContent = concentration;
                concentrationLabelEl.classList.add("pollutant-widget__concentration-label--initialized");
            }
        }

    } catch (error) {
        console.error(error);

        aqiWidgetEl.classList.add(`aqi-widget--not-available`);
        valueEl.textContent = "N/A";
        primaryPollutantEl.textContent = "N/A";
    }
}

async function initAqiChart(bandsData) {
    const aqiChartEl = document.querySelector(".aqi-chart");

    const [aqiCsv, tempCsv] = await Promise.all([
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=aqi"),
        fetchCSV("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=temp"),
    ]);

    const aqiData = parseCsv(aqiCsv);
    const tempData = parseCsv(tempCsv);
    const aqiBandsData = parseBands(bandsData.time_AQI);
    const tempBandsData = parseBands(bandsData.time_T);

    const chartContainer = document.querySelector(".aqi-chart__chart-container");

    function generateAqiChart() {
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

    generateAqiChart();
    window.addEventListener('resize', generateAqiChart);

    aqiChartEl.classList.add("aqi-chart--initialized");
}

async function initPollutantChart(bandsData, pollutantWidgetEl) {
    const pollutantWidgetToggleEl = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");
    const chartContainer = pollutantWidgetEl.querySelector(".pollutant-widget__chart");

    const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
    const unit = pollutantWidgetEl.getAttribute("data-unit");

    const pollutantCsv = await fetchCSV(`https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=${pollutant}`);

    const pollutantData = parseCsv(pollutantCsv);
    const pollutantBandsData = parseBands(bandsData[`time_${pollutant.replace(".", "")}`]);

    function generatePollutantChart() {
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

    pollutantWidgetToggleEl.addEventListener("click", () => {
        if (window.innerWidth < 800 && pollutantWidgetEl.classList.contains("pollutant-widget--expanded")) {
            generatePollutantChart();
        }
    });

    pollutantWidgetEl.addEventListener("transitionend", (event) => {
        if (event.propertyName == "height" && pollutantWidgetEl.classList.contains("pollutant-widget--expanded")) {
            generatePollutantChart();
        }
    });

    window.addEventListener("resize", () => {
        if (pollutantWidgetEl.classList.contains("pollutant-widget--expanded")) {
            generatePollutantChart();
        }
    });
}

async function initCharts() {
    const bandsData = await fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air?graph=bands");

    initAqiChart(bandsData);

    const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

    for (const pollutantWidgetEl of pollutantWidgetEls) {
        initPollutantChart(bandsData, pollutantWidgetEl);
    }
}

onResize();
window.addEventListener("resize", onResize);

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

for (const pollutantWidgetEl of pollutantWidgetEls) {
    const pollutantWidgetToggleEl = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");

    pollutantWidgetToggleEl.addEventListener("click", function () {
        if (pollutantWidgetToggleEl.getAttribute("aria-expanded") == "false") {
            pollutantWidgetEl.classList.add("pollutant-widget--expanded");
            pollutantWidgetToggleEl.setAttribute("aria-expanded", "true");
        } else {
            pollutantWidgetEl.classList.remove("pollutant-widget--expanded");
            pollutantWidgetToggleEl.setAttribute("aria-expanded", "false");
        }
    });
}

initCurrentValues();
initCharts();
