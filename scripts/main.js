(function() {
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

    let initializeAqiWidget = function(value, levelObj) {
        let aqiEl = document.querySelector(".aqi-widget");
        let valueEl = aqiEl.querySelector(".aqi-widget__value");
        let descriptionEl = aqiEl.querySelector(".aqi-widget__description-value");
        let meterEl = aqiEl.querySelector(".aqi-widget__meter");
        let inidicatorEl = aqiEl.querySelector(".aqi-widget__meter-indicator");
        let maxAqiValue = parseInt(meterEl.getAttribute("aria-valuemax"));

        if(value) {
            valueEl.textContent = value;
            descriptionEl.textContent = levelObj.label;
            meterEl.setAttribute("aria-valuenow", value);
            inidicatorEl.style.left = `${(value / maxAqiValue) * 100}%`;
        } else {
            aqiEl.classList.add("aqi-widget--data-unavailable");
            valueEl.textContent = "Not available";
            meterEl.setAttribute("aria-valuetext", "Not available");
        }
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

    let parseRealtimeMetricData = function(data) {
        let [values, mappings] = data;

        if(values) {
            for(let metric in values) {
                let metricVal = parseFloat(values[metric]);
                let metricMap = mappings[metric];
                let metricLvl;

                for(let i = 0; i < metricMap.length; i++) {
                    let level = metricMap[i]
                    if(metricVal < level.max || i == metricMap.length - 1) {
                        metricLvl = level;
                        break;
                    }
                }

                if(metric == "aqi") {
                    initializeAqiWidget(metricVal, metricLvl);
                } else {
                    let metricWidgetEl = document.querySelector(`.metric-widget[data-metric='${metric}']`);
                    if(metricWidgetEl) MetricWidget(metricWidgetEl, metricVal, metricLvl);
                }
            }
        } else {
            initializeAqiWidget();
            for(let metricWidgetEl of metricWidgetEls) MetricWidget(metricWidgetEl);
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

    // Fetch aqi/metric value mappings and real time values.
    // This method to wait on multiple fetches (mapping and real time data files) is taken from
    // https://gomakethings.com/waiting-for-multiple-all-api-responses-to-complete-with-the-vanilla-js-promise.all-method/
    Promise.all([
        fetch("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air"),
        fetch("mappings.json")
    ]).then(function(responses) {
        // Get a JSON object from each of the responses.
        return Promise.all(responses.map(function (response) {
            if(response.ok) return response.json();
        }));
    }).then(parseRealtimeMetricData);

    // Fetch metric data
    fetch("citaqs.txt")
        .then(function(res) { return res.text() })
        .then(parseMetricData);

    onResize();
    window.addEventListener("resize", onResize);
})();