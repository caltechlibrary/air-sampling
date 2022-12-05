import PollutantChart from "./PollutantChart.js";
import getPollutantDataFromCSV from "./getPollutantDataFromCSV.js";

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

let fetchMappings = async function(mappingsEndpoint) {
    const mappingsRes = await fetch(mappingsEndpoint);
    const mappingsJSON = await mappingsRes.json();
    return mappingsJSON;
};

let fetchCurrentValues = async function(currentValuesEndpoint) {
    const valuesRes = await fetch(currentValuesEndpoint);
    if(!valuesRes.ok) throw new Error("Current air values response was not OK");
    const valuesJSON = await valuesRes.json();
    return valuesJSON;
};

let getConditionFromAQIMapping = function(value, mapping) {
    for(const [condition, range] of Object.entries(mapping)) {
        if(value >= range[0] && value <= range[1]) {
            return condition;
        }
    }
}

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

let displayPollutantWidgetData = function(pollutant, concentration, unit, aqi, condition, warning) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");
    let concentrationEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration");
    let warningTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__warning-text");

    pollutantWidgetEl.classList.add(`pollutant-widget--${condition.toLowerCase().split(" ").join("-")}`);
    concentrationEl.textContent = `${concentration} ${unit}`;
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

let fetchPollutantCSV = async function(pollutantCsvEndpoint) {
    let res = await fetch(pollutantCsvEndpoint);
    return await res.text();
};

let initializePollutantWidgetChart = function(pollutant, data, unit) {
    let pollutantWidget = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let chartContainer = pollutantWidget.querySelector(".pollutant-widget__chart-container");
    let chartSvg = PollutantChart(data, { pollutant, unit });
    chartSvg.classList.add("pollutant-widget__chart");
    chartContainer.append(chartSvg);
};

onResize();
window.addEventListener("resize", onResize);

const mappings = await fetchMappings("mappings.json");

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

try{
    let currValues = await fetchCurrentValues("air-values.json");

    initializeHeader(currValues.time);

    displayAqiWidgetData(
        currValues.aqi, 
        getConditionFromAQIMapping(currValues.aqi, mappings.aqi)
    );

    for(let pollutantWidgetEl of pollutantWidgetEls) {
        let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        let { concentration, aqi } = currValues[pollutant];
        let unit = mappings.units[pollutant];
        let condition = getConditionFromAQIMapping(aqi, mappings.aqi);
        let warning = mappings[pollutant][condition];
        displayPollutantWidgetData(pollutant, concentration, unit, aqi, condition, warning);
    }
} catch(error) {
    if(error.message != "Current air values response was not OK") throw error;
    displayFailedAqiWidget();
    for(let pollutantWidgetEl of pollutantWidgetEls) displayFailedPollutantWidget(pollutantWidgetEl.getAttribute("data-pollutant"));
    console.log(error);
}

for(let pollutantWidgetEl of pollutantWidgetEls) initializePollutantWidgetAccordion(pollutantWidgetEl.getAttribute("data-pollutant"));

let pollutantCSVString = await fetchPollutantCSV("air-data.txt");
let pollutantData = getPollutantDataFromCSV(pollutantCSVString);

for(let pollutantWidgetEl of pollutantWidgetEls) {
    let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
    let data = pollutantData[pollutant];
    initializePollutantWidgetChart(pollutant, data.data, data.unit);
}