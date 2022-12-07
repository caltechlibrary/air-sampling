import { fetchJSON, fetchCSV } from "./modules/fetchHelpers.js";
import getConditionFromAQIMapping from "./modules/getConditionFromAQIMapping.js";
import getPollutantDataFromCSV from "./modules/getPollutantDataFromCSV.js";
import pollutantChart from "./modules/pollutantChart.js";

let onResize = function() {
    const topContainerEl = document.querySelector(".top-container");
    const resourceWidgetEl = document.querySelector(".resources-widget");
    const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");
    const layoutBreakpoint = 1100;

    let shiftToDesktop = window.innerWidth >= layoutBreakpoint && topContainerEl.childElementCount == 2;
    let shiftToMobile = window.innerWidth < layoutBreakpoint && topContainerEl.childElementCount == 3;
    
    if(shiftToDesktop || shiftToMobile) {
        let container = resourceWidgetEl.parentElement;
        while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
        if(shiftToDesktop) {
            container.classList.add("top-container__item");
            topContainerEl.appendChild(container);
        } else if(shiftToMobile) {
            container.classList.add("page__resources-widget-container");
            pollutantWidgetEls[pollutantWidgetEls.length - 1].after(container);
        }
    }
};

let initializeHeader = function(timestamp) {
    let dateEl = document.querySelector(".header__date");
    let date = new Date(timestamp * 1000);
    let time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
    let day = date.toLocaleDateString("en-US", { dateStyle: "medium" });
    dateEl.textContent = `${day} ${time}`;
};

let displayAqiWidgetData = function(value, condition) {
    let aqiWidgetEl = document.querySelector(".aqi-widget");
    let valueEl = document.querySelector(".aqi-widget__value");
    let descriptionEl = document.querySelector(".aqi-widget__condition-value");
    let inidicatorEl = document.getElementById("aqi-widget__meter-indicator");

    aqiWidgetEl.classList.add(`aqi-widget--${condition.toLowerCase().split(" ").join("-")}`);
    valueEl.textContent = value;
    descriptionEl.textContent = condition;
    inidicatorEl.setAttribute("x", `${(value / 500) * 100}%`);
    inidicatorEl.setAttribute("visibility", "visible");
};

let displayFailedAqiWidget = function() {
    let aqiEl = document.querySelector(".aqi-widget");
    let valueEl = document.querySelector(".aqi-widget__value");
    let conditionEl = document.querySelector(".aqi-widget__condition-value");

    aqiEl.classList.add("aqi-widget--data-unavailable");
    valueEl.textContent = "Not available";
    conditionEl.textContent = "Not available";
};

let displayPollutantWidgetData = function(pollutant, concentration, aqi, condition, warning) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");
    let concentrationEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration");
    let warningTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__warning-text");

    pollutantWidgetEl.classList.add(`pollutant-widget--${condition.toLowerCase().split(" ").join("-")}`);
    concentrationEl.textContent = concentration;
    aqiEl.textContent = aqi;
    warningTextEl.textContent = warning;
};

let displayFailedPollutantWidget = function(pollutant) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");

    pollutantWidgetEl.classList.add("pollutant-widget--data-unavailable");
    aqiEl.textContent = "Not available";
};

let initializePollutantWidgetAccordion = function(pollutant) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let toggleBtn = pollutantWidgetEl.querySelector(".pollutant-widget__toggle-btn");

    toggleBtn.addEventListener("click", function(){
        if(toggleBtn.getAttribute("aria-expanded") == "false") {
            pollutantWidgetEl.classList.add("pollutant-widget--expanded");
            toggleBtn.setAttribute("aria-expanded", "true");
        } else {
            pollutantWidgetEl.classList.remove("pollutant-widget--expanded");
            toggleBtn.setAttribute("aria-expanded", "false");
        }
    });
};

onResize();
window.addEventListener("resize", onResize);

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

try{
    const [currValues, mappings] = await Promise.all([fetchJSON("air-values.json"), fetchJSON("mappings.json")]);

    initializeHeader(currValues.time);

    displayAqiWidgetData(
        currValues.aqi, 
        getConditionFromAQIMapping(currValues.aqi, mappings.aqi)
    );

    for(let pollutantWidgetEl of pollutantWidgetEls) {
        let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        let { concentration, aqi } = currValues[pollutant];
        let condition = getConditionFromAQIMapping(aqi, mappings.aqi);
        let warning = mappings[pollutant][condition];
        displayPollutantWidgetData(pollutant, concentration, aqi, condition, warning);
    }
} catch(error) {
    if(error.message != "Network response was not OK") throw error;
    displayFailedAqiWidget();
    for(let pollutantWidgetEl of pollutantWidgetEls) displayFailedPollutantWidget(pollutantWidgetEl.getAttribute("data-pollutant"));
    console.log(error);
}

for(let pollutantWidgetEl of pollutantWidgetEls) initializePollutantWidgetAccordion(pollutantWidgetEl.getAttribute("data-pollutant"));

let pollutantCSVString = await fetchCSV("air-data.txt");
let pollutantData = getPollutantDataFromCSV(pollutantCSVString);

for(let pollutantWidgetEl of pollutantWidgetEls) {
    let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
    let chartContainer = pollutantWidgetEl.querySelector(".pollutant-widget__chart-container");
    let {data, unit} = pollutantData[pollutant];
    let chartSvg = pollutantChart(data, { pollutant, unit });
    chartSvg.classList.add("pollutant-widget__chart");
    chartContainer.append(chartSvg);
}