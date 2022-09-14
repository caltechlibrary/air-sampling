(async function() {
    //
	// Variables
	//
    const TOPCONTAINEREL = document.querySelector(".top-container");
    const RESOURCESWIDGETEL = document.querySelector(".resources-widget");
    const POLLUTANTWIDGETELS = document.querySelectorAll(".pollutant-widget");
    const LAYOUTBREAKPOINT = 1100;
    const AIRVALUESAPI = "air-values.json";
    const MAPPINGSENDPOINT = "mappings.json";
    const CHARTDATAENDPOINT = "air-data.txt";

    //
	// Functions
	//
    let onResize = function() {
        let container = RESOURCESWIDGETEL.parentElement;
        let shiftToDesktop = window.innerWidth >= LAYOUTBREAKPOINT && TOPCONTAINEREL.childElementCount == 2;
        let shiftToMobile = window.innerWidth < LAYOUTBREAKPOINT && TOPCONTAINEREL.childElementCount == 3;
        
        if(shiftToDesktop) {
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            container.classList.add("top-container__item");
            TOPCONTAINEREL.appendChild(container);
        } else if(shiftToMobile) {
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            container.classList.add("page__resources-widget-container");
            POLLUTANTWIDGETELS[POLLUTANTWIDGETELS.length - 1].after(container);
        }
    };

    let initializeHeader = function() {
        let dateEl = document.querySelector(".header__date");
        let date = new Date();
        let time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
        let day = date.toLocaleDateString("en-US", { dateStyle: "medium" });
        let dateTextNode = document.createTextNode(`${day} ${time}`);
        dateEl.appendChild(dateTextNode);
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

    let getValuesWithLabels = function(values, mappings) {
        let valuesWithLabels = {};
        for(let metric in values) {
            if(metric == "date" || metric == "time") {
                valuesWithLabels[metric] = values[metric];
            } else {
                valuesWithLabels[metric] = { value: values[metric], label: undefined, snippet: undefined };
                if(mappings.hasOwnProperty(metric)) {
                    let level = getLevelFromMapping(values[metric], mappings[metric]);
                    ({ label: valuesWithLabels[metric].label, snippet: valuesWithLabels[metric].snippet } = level);
                }
            }
        }
        return valuesWithLabels;
    };

    let getLevelFromMapping = function(value, mapping) {
        for(let level of mapping) {
            if(value < level.max || !level.hasOwnProperty("max")) {
                return level;
            }
        }
    };

    let initializeAqiWidget = function(value, label) {
        let aqiEl = document.querySelector(".aqi-widget");
        let valueEl = aqiEl.querySelector(".aqi-widget__value");
        let descriptionEl = aqiEl.querySelector(".aqi-widget__description-value");
        let meterEl = aqiEl.querySelector(".aqi-widget__meter");
        let inidicatorEl = aqiEl.querySelector(".aqi-widget__meter-indicator");
        let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

        if(value && label) {
            valueEl.textContent = value;
            descriptionEl.textContent = label;
            meterEl.setAttribute("aria-valuenow", value);
            inidicatorEl.style.left = `${(value / maxAqiValue) * 100}%`;
        } else {
            aqiEl.classList.add("aqi-widget--data-unavailable");
            valueEl.textContent = "Not available";
            meterEl.setAttribute("aria-valuetext", "Not available");
        }
    };

    let initializePollutantWidget = function(pollutant, value, label, snippet) {
        let pollutantWidgetEl = document.querySelector(`.pollutant-widget[data-pollutant='${pollutant}']`);
        let valueLabel = pollutantWidgetEl.querySelector(".pollutant-widget__value-label");
        let qualityLabel = pollutantWidgetEl.querySelector(".pollutant-widget__quality-label");
        let previewSnippet = pollutantWidgetEl.querySelector(".pollutant-widget__preview-snippet");

        if(value && label && snippet) {
            valueLabel.textContent = value;
            qualityLabel.textContent = label;
            previewSnippet.textContent = snippet;
        } else {
            valueLabel.textContent = "Not available";
        }
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
        let chartSvg = LineChart(data, { label: `${pollutant} ${unit}` });
        chartSvg.classList.add("pollutant-widget__chart");
        chartContainer.append(chartSvg);
    };

    onResize();
    window.addEventListener("resize", onResize);

    initializeHeader();

    try{
        let [currValues, mappings] = await fetchCurrentValuesAndMappings();
        let valuesWithLabels = getValuesWithLabels(currValues, mappings);
        initializeAqiWidget(valuesWithLabels.aqi.value, valuesWithLabels.aqi.label);
        for(let pollutantWidgetEl of POLLUTANTWIDGETELS) {
            let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
            let valueWithLabel = valuesWithLabels[pollutant];
            initializePollutantWidget(pollutant, valueWithLabel.value, valueWithLabel.label, valueWithLabel.snippet);
        }
    } catch(error) {
        initializeAqiWidget();
        for(let pollutantWidgetEl of POLLUTANTWIDGETELS) {
            let pollutant = pollutantWidgetEl.getAttribute("data-pollutant");
            initializePollutantWidget(pollutant);
        }
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