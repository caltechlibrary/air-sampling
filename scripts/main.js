(async function() {
    //
	// Variables
	//
    const WIDGETSCONTAINEREL = document.querySelector(".widgets-container");
    const CONTINUEDREADINGWIDGETEL = document.querySelector(".continued-reading-widget");
    const METRICWIDGETELS = document.querySelectorAll(".metric-widget");
    const LAYOUTBREAKPOINT = 1100;
    const AIRVALUESAPI = "https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air";
    const MAPPINGSENDPOINT = "mappings.json";
    const CHARTDATAENDPOINT = "air-data.txt";
    let metricChartEls = document.querySelectorAll(".metric-chart");

    //
	// Functions
	//
    let onResize = function() {
        if(window.innerWidth >= LAYOUTBREAKPOINT && WIDGETSCONTAINEREL.childElementCount == 2) {
            let container = CONTINUEDREADINGWIDGETEL.parentElement;
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            container.classList.add("widgets-container__widget");
            WIDGETSCONTAINEREL.appendChild(container);
        } else if(window.innerWidth < LAYOUTBREAKPOINT && WIDGETSCONTAINEREL.childElementCount == 3) {
            let container = CONTINUEDREADINGWIDGETEL.parentElement;
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            container.classList.add("continued-reading-widget-container");
            METRICWIDGETELS[METRICWIDGETELS.length - 1].after(container);
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
        let valueEl = document.querySelector(".aqi-widget__value");
        let descriptionEl = document.querySelector(".aqi-widget__description-value");
        let meterEl = document.querySelector(".aqi-widget__meter");
        let inidicatorEl = document.querySelector(".aqi-widget__meter-indicator");
        let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

        if(value) {
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

    let initializeMetricWidget = function(metric, value, label, snippet) {
        let metricWidgetEl = document.querySelector(`.metric-widget[data-metric='${metric}']`);
        let valueLabel = metricWidgetEl.querySelector(".metric-widget__value-label");
        let qualityLabel = metricWidgetEl.querySelector(".metric-widget__quality-label");
        let previewSnippet = metricWidgetEl.querySelector(".metric-widget__preview-snippet");

        if(value) {
            valueLabel.textContent = value;
            qualityLabel.textContent = label;
            previewSnippet.textContent = snippet;
        } else {
            valueLabel.textContent = "Not available";
        }
    };

    let initializeMetricWidgetAccordion = function(metric) {
        let metricWidgetEl = document.querySelector(`.metric-widget[data-metric='${metric}']`);
        let toggleBtn = metricWidgetEl.querySelector(".metric-widget__toggle-btn");
        let contentPanel = metricWidgetEl.querySelector(".metric-widget__panel");
        let previewSnippet = metricWidgetEl.querySelector(".metric-widget__preview-snippet");

        toggleBtn.addEventListener("click", function(){
            if(toggleBtn.getAttribute("aria-expanded") == "false") {
                previewSnippet.classList.add("metric-widget__preview-snippet--hidden");
                contentPanel.classList.remove("metric-widget__panel--collapsed");
                toggleBtn.setAttribute("aria-expanded", "true");
            } else {
                previewSnippet.classList.remove("metric-widget__preview-snippet--hidden");
                contentPanel.classList.add("metric-widget__panel--collapsed");
                toggleBtn.setAttribute("aria-expanded", "false");
            }
        });
    };

    let fetchMetricCSV = async function() {
        let res = await fetch(CHARTDATAENDPOINT);
        return await res.text();
    };

    let getMetricData = function(csvString) {
        let metricData = {};
        let rows = d3.csvParse(csvString, d3.autoType);
        let timeField = rows.columns[0];

        for(let metric of rows.columns) {
            if(metric != timeField) {
                metricData[metric] = { unit: rows[0][metric], data: [] };
            }
        }

        for(let i = 1; i < rows.length; i++) {
            let row = rows[i];
            let time = row[timeField] * 1000;
            for(let metric in row) {
                if(metric != timeField) {
                    let value = row[metric];
                    metricData[metric].data.push({ time, value });
                }
            }
        }

        return metricData;
    };

    let initializeMetricChart = function(metric, data, unit) {
        let metricChartEl = document.querySelector(`.metric-chart[data-metric='${metric}']`);
        let chartSvg = LineChart(data, { label: `${metric} ${unit}` });
        chartSvg.classList.add("metric-chart__svg");
        metricChartEl.append(chartSvg);
    };

    onResize();
    window.addEventListener("resize", onResize);

    initializeHeader();

    let [currValues, mappings] = await fetchCurrentValuesAndMappings();
    let valuesWithLabels = getValuesWithLabels(currValues, mappings);
    initializeAqiWidget(valuesWithLabels.aqi.value, valuesWithLabels.aqi.label);
    for(let metricWidgetEl of METRICWIDGETELS) {
        let metric = metricWidgetEl.getAttribute("data-metric");
        let valueWithLabel = valuesWithLabels[metric];
        initializeMetricWidget(metric, valueWithLabel.value, valueWithLabel.label, valueWithLabel.snippet);
    }

    for(let metricWidgetEl of METRICWIDGETELS) initializeMetricWidgetAccordion(metricWidgetEl.getAttribute("data-metric"));

    let metricCSVString = await fetchMetricCSV();
    let metricData = getMetricData(metricCSVString);
    for(let metricChartEl of metricChartEls) {
        let metric = metricChartEl.getAttribute("data-metric");
        let data = metricData[metric];
        initializeMetricChart(metric, data.data, data.unit);
    }
})();