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

    let parseMappingsData = function(data) {
        console.log(data);
    };

    let parseRealtimeMetricData = function(data) {
        for(let metric in data) {
            let metricVal = parseFloat(data[metric]);
            if(metric == "aqi") {
                AqiWidget(aqiEl, metricVal);
            } else {
                let metricWidgetEl = document.querySelector(`.metric-widget[data-metric='${metric}']`);
                if(metricWidgetEl) MetricWidget(metricWidgetEl, metricVal);
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

    Header(headerEl);

    // Fetch aqi/metric value mappings
    fetch("mappings.json")
        .then(function(res) { return res.json() })
        .then(parseMappingsData);

    // Fetch real time aqi/metric values
    fetch("https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/get_air")
        .then(function(res) { return res.json() })
        .then(parseRealtimeMetricData);

    // Fetch metric data
    fetch("citaqs.txt")
        .then(function(res) { return res.text() })
        .then(parseMetricData);

    onResize();
    window.addEventListener("resize", onResize);
})();