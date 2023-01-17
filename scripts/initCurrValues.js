import { fetchJSON } from "./modules/fetchHelpers.js";
import getAqiCondition from "./modules/getAqiCondition.js";

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

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

try{
    const [currValues, mappings] = await Promise.all([
        fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air"), 
        fetchJSON("mappings.json")
    ]);

    initializeHeader(currValues.time);

    displayAqiWidgetData(
        currValues.aqi, 
        getAqiCondition(currValues.aqi)
    );

    for(let pollutantWidgetEl of pollutantWidgetEls) {
        let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        let concentration = currValues[pollutant];
        let aqi = currValues[`${pollutant}_aqi`];
        let condition = getAqiCondition(aqi);
        let warning = mappings[pollutant][condition];
        displayPollutantWidgetData(pollutant, concentration, aqi, condition, warning);
    }
} catch(error) {
    if(error.message != "Network response was not OK") throw error;
    displayFailedAqiWidget();
    for(let pollutantWidgetEl of pollutantWidgetEls) displayFailedPollutantWidget(pollutantWidgetEl.getAttribute("data-pollutant"));
    console.log(error);
}