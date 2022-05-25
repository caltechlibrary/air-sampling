(function() {
    let headerEl = document.querySelector(".header");
    let aqiEl = document.querySelector(".aqi-widget");
    let widgetsContainer = document.querySelector(".widgets-container");
    let metricWidgetEls = document.querySelectorAll(".metric-widget");
    let continuedReadingWidgetEl = document.querySelector(".continued-reading-widget");

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
                if(metric == "aqi") {
                    AqiWidget(aqiEl, metricVal, metricMap);
                } else {
                    let metricWidgetEl = document.querySelector(`.metric-widget[data-metric='${metric}']`);
                    if(metricWidgetEl) MetricWidget(metricWidgetEl, metricVal, metricMap);
                }
            }
        } else {
            AqiWidget(aqiEl);
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

    Header(headerEl);

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