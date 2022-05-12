(function() {
    let headerEl = document.querySelector(".header");
    let widgetsContainer = document.querySelector(".widgets-container");
    let metricWidgetEls = document.querySelectorAll(".metric-widget");
    let metricChartEls = document.querySelectorAll(".metric-chart");
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
    };

    // Fetch metric data
    fetch("citaqs.txt")
        .then(function(res) { return res.text() })
        .then(parseMetricData);

    // Initialize components
    Header(headerEl);
    for(let metricWidgetEl of metricWidgetEls) MetricWidget(metricWidgetEl);
    for(let metricChartEl of metricChartEls) MetricChart(metricChartEl);

    onResize();
    window.addEventListener("resize", onResize);
})();