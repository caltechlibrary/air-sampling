import { fetchJSON } from "./modules/fetchHelpers.js";

const DUMMY = document.documentElement.hasAttribute("data-dummy");

function getCondition(aqi) {
    let condition;

    if(aqi <= 50) {
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

function conditionToText(condition) {
    const words = condition.split("-");
    const wordsCapitalized = [];

    for(const word of words) {
        wordsCapitalized.push(word.charAt(0).toUpperCase() + word.substring(1));
    }

    return wordsCapitalized.join(" ");
}

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
    let aqiMeterEl = document.querySelector(".aqi-widget__meter");
    let inidicatorEl = document.getElementById("aqi-widget__meter-indicator");

    let conditionText = conditionToText(condition);

    aqiWidgetEl.classList.add(`aqi-widget--${condition}`);
    valueEl.textContent = value;
    descriptionEl.textContent = conditionText;
    aqiMeterEl.setAttribute("aria-label", `Current AQI value falls within the "${condition}" category.`)
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

function displayPollutantWidgetData(pollutant, concentration, aqi, condition) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");
    let concentrationEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration-text");
    let warningTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__warning-text");

    let warningText = pollutantWidgetEl.getAttribute(`data-${condition}`);

    pollutantWidgetEl.classList.add(`pollutant-widget--${condition}`);
    concentrationEl.textContent = concentration;
    aqiEl.textContent = aqi;
    warningTextEl.textContent = warningText;
};

function displayFailedPollutantWidget(pollutant) {
    let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
    let aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");

    pollutantWidgetEl.classList.add("pollutant-widget--data-unavailable");
    aqiEl.textContent = "Not available";
};

let data;

try {
    data = await fetchJSON(DUMMY ? "dummy/values.json" : "https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air");
} catch(error) {
    console.log(error);
}

const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

if(data) {
    initializeHeader(data.time);

    displayAqiWidgetData(data.aqi, getCondition(data.aqi));

    for(let pollutantWidgetEl of pollutantWidgetEls) {
        const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        const concentration = data[pollutant];
        const aqi = data[`${pollutant}_aqi`];
        const condition = getCondition(aqi);
        displayPollutantWidgetData(pollutant, concentration, aqi, condition);
    }
} else {
    displayFailedAqiWidget();
    for(let pollutantWidgetEl of pollutantWidgetEls) displayFailedPollutantWidget(pollutantWidgetEl.getAttribute("data-pollutant"));
}