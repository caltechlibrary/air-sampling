let MetricWidget = function(root) {

    let expandToggle = root.querySelector(".metric-widget__toggle");
    let summary = root.querySelector(".metric-widget__summary");
    let description = root.querySelector(".metric-widget__description");

    let toggleWidgetExpansion = function() {
        if(expandToggle.getAttribute("aria-expanded") == "false") {
            root.classList.remove("metric-widget--collapsed");
            summary.classList.add("metric-widget__summary--hidden");
            description.classList.remove("metric-widget__description--hidden");
            expandToggle.setAttribute("aria-expanded", "true");
        } else {
            root.classList.add("metric-widget--collapsed");
            summary.classList.remove("metric-widget__summary--hidden");
            description.classList.add("metric-widget__description--hidden");
            expandToggle.setAttribute("aria-expanded", "false");
        }
    };

    expandToggle.addEventListener("click", toggleWidgetExpansion);

    return {
        root
    };

};