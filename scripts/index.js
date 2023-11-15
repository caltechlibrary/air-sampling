import fetchJSON from "./modules/fetchJSON.js";

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

function formatCondition(condition) {
    const words = condition.split("-");
    const wordsCapitalized = [];

    for(const word of words) {
        wordsCapitalized.push(word.charAt(0).toUpperCase() + word.substring(1));
    }

    return wordsCapitalized.join(" ");
}

async function initCurrentValues() {
    const data = await fetchJSON("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air");

    // Init header
    const dateEl = document.querySelector(".header__date");
    const date = new Date(data.time * 1000);
    const time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
    const day = date.toLocaleDateString("en-US", { dateStyle: "medium" });
    dateEl.textContent = `${day} ${time}`;

    // Init aqi widget
    const aqiWidgetEl = document.querySelector(".aqi-widget");
    const valueEl = document.querySelector(".aqi-widget__value");
    const descriptionEl = document.querySelector(".aqi-widget__condition-value");
    const aqiMeterEl = document.querySelector(".aqi-widget__meter");
    const inidicatorEl = document.getElementById("aqi-widget__meter-indicator");

    const condition = getCondition(data.aqi);
    const conditionFormatted = formatCondition(condition);

    aqiWidgetEl.classList.add(`aqi-widget--${condition}`);
    valueEl.textContent = data.aqi;
    descriptionEl.textContent = conditionFormatted;
    aqiMeterEl.setAttribute("aria-label", `Current AQI value falls within the "${condition}" category.`);
    inidicatorEl.setAttribute("x", `${(data.aqi / 500) * 100}%`);
    inidicatorEl.setAttribute("visibility", "visible");

    // Init pollutant widgets
    const pollutantWidgetEls = document.querySelectorAll(".pollutant-widget");

    for(const pollutantWidgetEl of pollutantWidgetEls) {
        const aqiEl = pollutantWidgetEl.querySelector(".pollutant-widget__aqi");
        const concentrationEl = pollutantWidgetEl.querySelector(".pollutant-widget__concentration-text");
        const warningTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__warning-text");

        const pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        const concentration = data[pollutant];
        const aqi = data[`${pollutant}_aqi`];
    
        const condition = getCondition(aqi);
        const warningText = pollutantWidgetEl.getAttribute(`data-${condition}`);
    
        pollutantWidgetEl.classList.add(`pollutant-widget--${condition}`);
        concentrationEl.textContent = concentration;
        aqiEl.textContent = aqi;
        warningTextEl.textContent = warningText;
    }
}

initCurrentValues();