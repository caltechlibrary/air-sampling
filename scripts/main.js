(function() {
    let headerEl = document.querySelector(".header");
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
        for(let metric in data) {
            if(metric == "aqi") {
                // to do
            } else {
                let metricWidgetEl = document.querySelector(`.metric-widget[data-metric='${metric}']`);
                if(metricWidgetEl) MetricWidget(metricWidgetEl, data[metric]);
            }
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

    parseRealtimeMetricData({"NO": 1.05, "PM2.5": 6.0, "O3": 10.9, "time": 1579996805.0, "CO": 1.0, "PM10": 19.6, "NO2": 33.5, "temp": 21.1, "date": "2022-05-16", "SO2": 1.13, "pressure": 740.7, "NOy": 38.5, "aqi": 31.0});

    // Fetch metric data
    fetch("citaqs.txt")
        .then(function(res) { return res.text() })
        .then(parseMetricData);

    Header(headerEl);

    onResize();
    window.addEventListener("resize", onResize);
})();