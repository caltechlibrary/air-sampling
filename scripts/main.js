(async function() {
    //
	// Variables
	//
    const WIDGETSCONTAINEREL = document.querySelector(".widgets-container");
    const CONTINUEDREADINGWIDGETEL = document.querySelector(".continued-reading-widget");
    const METRICWIDGETELS = document.querySelectorAll(".metric-widget");
    const LAYOUTBREAKPOINT = 1100;
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
            fetch("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air"),
            fetch("mappings.json" )
        ]);

        return await Promise.all([
            valuesRes.json(),
            mappingsRes.json()
        ]);
    };

    let getValuesWithLabels = function(values, mappings) {
        let valuesWithLabels = {};
        for(let metric in values) {
            valuesWithLabels[metric] = { value: values[metric] };
            if(mappings.hasOwnProperty(metric)) {
                for(let level of mappings[metric]) {
                    if(values[metric] < level.max || !level.hasOwnProperty("max")) {
                        if(level.label) valuesWithLabels[metric].label = level.label;
                        if(level.snippet) valuesWithLabels[metric].snippet = level.snippet;
                        break;
                    }
                }
            }
        }
        return valuesWithLabels;
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

    let fetchMetricData = async function() {
        let res = await fetch("citaqs.txt");
        return await res.text();
    };

    let getMetricChartData = function(data) {
        let chartData = {};
        let rows = d3.csvParse(data);
        let timeMetric = "Start Time";

        for(let metric of rows.columns) {
            metricTrimmed = metric.trim();
            if(metricTrimmed != timeMetric) {
                let unit = rows[0][metric].trim();
                chartData[metricTrimmed] = { unit, data: [] };
            }
        }

        for(let i = 1; i < rows.length; i++) {
            let row = rows[i];
            for(let metric in row) {
                let metricTrimmed = metric.trim();
                if(metricTrimmed != timeMetric) {
                    let time = parseFloat(row[timeMetric].trim()) * 1000;
                    let value = parseFloat(row[metric].trim());
                    chartData[metricTrimmed].data.push({ time, value });
                }
            }
        }

        return chartData;
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
        valueWithLabel = valuesWithLabels[metric];
        initializeMetricWidget(metric, valueWithLabel.value, valueWithLabel.label, valueWithLabel.snippet);
        initializeMetricWidgetAccordion(metric);
    }

    let metricData = await fetchMetricData();
    let metricChartData = getMetricChartData(metricData);
    for(let metricChartEl of metricChartEls) {
        let metric = metricChartEl.getAttribute("data-metric");
        let chartData = metricChartData[metric];
        initializeMetricChart(metric, chartData.data, chartData.unit);
    }
})();