(function() {
    let headerEl = document.querySelector(".header");
    let metricWidgetEls = document.querySelectorAll(".metric-widget");
    let header = Header(headerEl);
    header.init();
    for(let metricWidgetEl of metricWidgetEls) MetricWidget(metricWidgetEl);
})();