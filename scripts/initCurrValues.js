import { fetchJSON } from "./modules/fetchHelpers.js";
import getAqiCondition from "./modules/getAqiCondition.js";

const DUMMY = document.documentElement.hasAttribute("data-dummy")

function initializeHeader(timestamp) {
    let dateEl = document.querySelector(".header__date");
    let date = new Date(timestamp * 1000);
    let time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
    let day = date.toLocaleDateString("en-US", { dateStyle: "medium" });
    dateEl.textContent = `${day} ${time}`;
};

function displayAqiWidgetData(value, condition) {
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

function displayFailedAqiWidget() {
    let aqiEl = document.querySelector(".aqi-widget");
    let valueEl = document.querySelector(".aqi-widget__value");
    let conditionEl = document.querySelector(".aqi-widget__condition-value");

    aqiEl.classList.add("aqi-widget--data-unavailable");
    valueEl.textContent = "Not available";
    conditionEl.textContent = "Not available";
};

function displayPollutantWidgetData(pollutant, concentration, aqi, condition, warning) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");
    let concentrationEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration");
    let warningTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__warning-text");

    pollutantWidgetEl.classList.add(`pollutant-widget--${condition.toLowerCase().split(" ").join("-")}`);
    concentrationEl.textContent = concentration;
    aqiEl.textContent = aqi;
    warningTextEl.textContent = warning;
};

function displayFailedPollutantWidget(pollutant) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");

    pollutantWidgetEl.classList.add("pollutant-widget--data-unavailable");
    aqiEl.textContent = "Not available";
};

const api = DUMMY ? "dummy/values.json" : "https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air"

let response;

try {
    response = await Promise.all([
        fetchJSON(api), 
        fetchJSON("conditions.json")
    ]);
} catch(error) {
    console.log(error);
}

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

if(response) {
    const [currValues, conditions] = response; 

    initializeHeader(currValues.time);

    displayAqiWidgetData(currValues.aqi, getAqiCondition(currValues.aqi));

    for(let pollutantWidgetEl of pollutantWidgetEls) {
        const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        const concentration = currValues[pollutant];
        const aqi = currValues[`${pollutant}_aqi`];
        const condition = getAqiCondition(aqi);
        const warning = conditions[pollutant][condition];
        displayPollutantWidgetData(pollutant, concentration, aqi, condition, warning);
    }
} else {
    displayFailedAqiWidget();
    for(let pollutantWidgetEl of pollutantWidgetEls) displayFailedPollutantWidget(pollutantWidgetEl.getAttribute("data-pollutant"));
}