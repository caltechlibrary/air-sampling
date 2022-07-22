(async function() {
    let widgetsContainer = document.querySelector(".widgets-container");
    let metricWidgetEls = document.querySelectorAll(".metric-widget");
    let continuedReadingWidgetEl = document.querySelector(".continued-reading-widget");

    let initializeHeader = function() {
        let headerEl = document.querySelector(".header");
        let dateEl = headerEl.querySelector(".header__date");
        let date = new Date();
        let time = date.toLocaleTimeString("en-US", { hour12: true, timeStyle: "short" });
        let day = date.toLocaleDateString("en-US", { dateStyle: "medium" })
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
        let toggleBtn = metricWidgetEl.querySelector(".metric-widget__toggle-btn");
        let contentPanel = metricWidgetEl.querySelector(".metric-widget__panel");
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

    let onResize = function() {
        if(window.innerWidth >= 1100 && widgetsContainer.childElementCount == 2) {
            let container = continuedReadingWidgetEl.parentElement;
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            container.classList.add("widgets-container__widget");
            widgetsContainer.appendChild(container);
        } else if(window.innerWidth < 1100 && widgetsContainer.childElementCount == 3) {
            let container = continuedReadingWidgetEl.parentElement;
            while(container.classList.length > 0) container.classList.remove(container.classList.item(0));
            container.classList.add("continued-reading-widget-container");
            metricWidgetEls[metricWidgetEls.length - 1].after(container);
        }
    };

    let parseMetricData = function(text) {
        let rows = d3.csvParse(text);
        let metricData = {};
        let timeMetric = "Start Time";

        for(let metric of rows.columns) {
            metricTrimmed = metric.trim();
            if(metricTrimmed != timeMetric) {
                let unit = rows[0][metric].trim();
                metricData[metricTrimmed] = { unit, data: [] };
            }
        }

        for(let i = 1; i < rows.length; i++) {
            for(let metric in rows[i]) {
                metricTrimmed = metric.trim();
                if(metricTrimmed != timeMetric) {
                    let time = parseFloat( rows[i][timeMetric].trim() ) * 1000;
                    let value = parseFloat( rows[i][metric].trim() );
                    metricData[metricTrimmed].data.push({ time, value });
                }
            }
        }

        for(let metric in metricData) {
            let metricChartEl = document.querySelector(`.metric-chart[data-metric='${metric}']`);
            if(metricChartEl) MetricChart(metricChartEl, metricData[metric]);
        }
    };

    initializeHeader();

    let [currValues, mappings] = await fetchCurrentValuesAndMappings();
    let valuesWithLabels = getValuesWithLabels(currValues, mappings);
    
    initializeAqiWidget(valuesWithLabels.aqi.value, valuesWithLabels.aqi.label);
    
    for(let metricWidgetEl of metricWidgetEls) {
        let metric = metricWidgetEl.getAttribute("data-metric");
        valueWithLabel = valuesWithLabels[metric];
        initializeMetricWidget(metric, valueWithLabel.value, valueWithLabel.label, valueWithLabel.snippet);
    }

    // Fetch metric data
    fetch("citaqs.txt")
        .then(function(res) { return res.text() })
        .then(parseMetricData);

    onResize();
    window.addEventListener("resize", onResize);
})();