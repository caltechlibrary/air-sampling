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

    let parseMetricData = function(text) {
        let rows = d3.csvParse(text);
        let metricData = {};
        let timeMetric = "Start Time";

        for(let metric of rows.columns) {
            metric = metric.trim();
            if(metric != timeMetric) metricData[metric] = [];
        }

        for(let i = 1; i < rows.length; i++) {
            for(let metric in rows[i]) {
                metricTrimmed = metric.trim();
                if(metricTrimmed != timeMetric) {
                    let time = parseFloat( rows[i][timeMetric].trim() );
                    let value = parseFloat( rows[i][metric].trim() );
                    metricData[metricTrimmed].push({ time, value });
                }
            }
        }

        for(let metric in metricData) {
            let metricChartEl = document.querySelector(`.metric-chart[data-metric='${metric}']`);
            if(metricChartEl) MetricChart(metricChartEl, metricData[metric]);
        }
    };

    // Fetch metric data
    fetch("citaqs.txt")
        .then(function(res) { return res.text() })
        .then(parseMetricData);

    // Initialize components
    Header(headerEl);
    for(let metricWidgetEl of metricWidgetEls) MetricWidget(metricWidgetEl);

    onResize();
    window.addEventListener("resize", onResize);
})();