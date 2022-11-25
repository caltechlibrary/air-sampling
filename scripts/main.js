(async function() {
    //
	// Variables
	//
    const TOPCONTAINEREL = document.querySelector(".top-container");
    const RESOURCESWIDGETEL = document.querySelector(".resources-widget");
    const POLLUTANTWIDGETELS = document.querySelectorAll(".pollutant-widget");
    const LAYOUTBREAKPOINT = 1100;
    const AIRVALUESAPI = "https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air";
    const MAPPINGSENDPOINT = "mappings.json";
    const CHARTDATAENDPOINT = "air-data.txt";

    //
	// Functions
	//
    let onResize = function() {
        let shiftToDesktop = window.innerWidth >= LAYOUTBREAKPOINT && TOPCONTAINEREL.childElementCount == 2;
        let shiftToMobile = window.innerWidth < LAYOUTBREAKPOINT && TOPCONTAINEREL.childElementCount == 3;
        
        if(shiftToDesktop || shiftToMobile) {
            let container = RESOURCESWIDGETEL.parentElement;
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            if(shiftToDesktop) {
                container.classList.add("top-container__item");
                TOPCONTAINEREL.appendChild(container);
            } else if(shiftToMobile) {
                container.classList.add("page__resources-widget-container");
                POLLUTANTWIDGETELS[POLLUTANTWIDGETELS.length - 1].after(container);
            }
        }
    };

    let initializeHeader = function() {
        let dateEl = document.querySelector(".header__date");
        let date = new Date();
        let time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
        let day = date.toLocaleDateString("en-US", { dateStyle: "medium" });
        dateEl.textContent = `${day} ${time}`;
    };

    let fetchCurrentValuesAndMappings = async function() {
        const [valuesRes, mappingsRes] = await Promise.all([
            fetch(AIRVALUESAPI),
            fetch(MAPPINGSENDPOINT)
        ]);

        if(!valuesRes.ok) throw new Error("Current air values response was not OK");
        
        return await Promise.all([
            valuesRes.json(),
            mappingsRes.json()
        ]);
    };

    let getConditionFromAQIMapping = function(value, mapping) {
        for(const [condition, range] of Object.entries(mapping)) {
            if(value >= range[0] && value <= range[1]) {
                return condition;
            }
        }
    }

    let displayAqiWidgetData = function(value, label) {
        let valueEl = document.querySelector(".aqi-widget__value");
        let descriptionEl = document.querySelector(".aqi-widget__description-value");
        let inidicatorEl = document.getElementById("aqi-widget__meter-indicator");

        valueEl.textContent = value;
        descriptionEl.textContent = label;
        inidicatorEl.setAttribute("x", `${(value / 500) * 100}%`);
        inidicatorEl.setAttribute("visibility", "visible");
    };

    let displayFailedAqiWidget = function() {
        let aqiEl = document.querySelector(".aqi-widget");
        let valueEl = document.querySelector(".aqi-widget__value");
        let descriptionEl = document.querySelector(".aqi-widget__description-value");

        aqiEl.classList.add("aqi-widget--data-unavailable");
        valueEl.textContent = "Not available";
        descriptionEl.textContent = "Not available";
    };

    let displayPollutantWidgetData = function(pollutant, value, label, warning) {
        let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
        let valueEl = pollutantWidgetEl.querySelector(".pollutant-widget__value");
        let qualityEl = pollutantWidgetEl.querySelector(".pollutant-widget__quality");
        let descriptionTextEl = pollutantWidgetEl.querySelector(".pollutant-widget__description-text");

        valueEl.textContent = value;
        qualityEl.textContent = label;
        descriptionTextEl.textContent = warning;
    };

    let displayFailedPollutantWidget = function(pollutant) {
        let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
        let valueEl = pollutantWidgetEl.querySelector(".pollutant-widget__value");

        pollutantWidgetEl.classList.add("pollutant-widget--data-unavailable");
        valueEl.textContent = "Not available";
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

    let fetchPollutantCSV = async function() {
        let res = await fetch(CHARTDATAENDPOINT);
        return await res.text();
    };

    let getPollutantData = function(csvString) {
        let pollutantData = {};
        let rows = d3.csvParse(csvString, d3.autoType);
        let timeField = rows.columns[0];

        for(let pollutant of rows.columns) {
            if(pollutant != timeField) {
                pollutantData[pollutant] = { unit: rows[0][pollutant], data: [] };
            }
        }

        for(let i = 1; i < rows.length; i++) {
            let row = rows[i];
            let time = row[timeField] * 1000;
            for(let pollutant in row) {
                if(pollutant != timeField) {
                    pollutantData[pollutant].data.push({ time, value: row[pollutant] });
                }
            }
        }

        return pollutantData;
    };

    let initializePollutantWidgetChart = function(pollutant, data, unit) {
        let pollutantWidget = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
        let chartContainer = pollutantWidget.querySelector(".pollutant-widget__chart-container");
        let chartSvg = LineChart(data, { label: `${pollutant} ${unit}`, description: `Chart of recent ${pollutant} values.` });
        chartSvg.classList.add("pollutant-widget__chart");
        chartContainer.append(chartSvg);
    };

    //
	// Inits and Event Listeners
	//
    onResize();
    window.addEventListener("resize", onResize);

    initializeHeader();

    try{
        let [currValues, mappings] = await fetchCurrentValuesAndMappings();
        displayAqiWidgetData(currValues.aqi, getConditionFromAQIMapping(currValues.aqi, mappings.aqi));
        for(let pollutantWidgetEl of POLLUTANTWIDGETELS) {
            let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
            let condition = getConditionFromAQIMapping(currValues[pollutant], mappings.aqi);
            let warning = mappings[pollutant.replace(/\./g, "").toLocaleLowerCase()][condition];
            displayPollutantWidgetData(pollutant, currValues[pollutant], condition, warning);
        }
    } catch(error) {
        if(error.message != "Current air values response was not OK") throw error;
        displayFailedAqiWidget();
        for(let pollutantWidgetEl of POLLUTANTWIDGETELS) displayFailedPollutantWidget(pollutantWidgetEl.getAttribute("data-pollutant"));
        console.log(error);
    }

    for(let pollutantWidgetEl of POLLUTANTWIDGETELS) initializePollutantWidgetAccordion(pollutantWidgetEl.getAttribute("data-pollutant"));

    let pollutantCSVString = await fetchPollutantCSV();
    let pollutantData = getPollutantData(pollutantCSVString);

    for(let pollutantWidgetEl of POLLUTANTWIDGETELS) {
        let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
        let data = pollutantData[pollutant];
        initializePollutantWidgetChart(pollutant, data.data, data.unit);
    }
})();