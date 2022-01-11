let MetricWidget = function(root) {

    let toggleBtn = root.querySelector(".metric-widget__toggle-btn");
    let previewSnippet = root.querySelector(".metric-widget__preview-snippet");
    let contentPanel = root.querySelector(".metric-widget__panel");
    let chart = root.querySelector(".metric-widget__chart");

    let togglePanel = function() {
        if(toggleBtn.getAttribute("aria-expanded") == "false") {
            previewSnippet.classList.add("metric-widget__preview-snippet--hidden");
            contentPanel.classList.remove("metric-widget__panel--collapsed");
            toggleBtn.setAttribute("aria-expanded", "true");
        } else {
            previewSnippet.classList.remove("metric-widget__preview-snippet--hidden");
            contentPanel.classList.add("metric-widget__panel--collapsed");
            toggleBtn.setAttribute("aria-expanded", "false");
        }
    };

    let initChart = function(data) {
        let chartSVG = LineChart(data, {
            width: 1000,
            height: 270,
            label: "PM2.5 ug m\u207B\u00B3",
            color: "black"
        });
        chart.appendChild(chartSVG);
    };

    toggleBtn.addEventListener("click", togglePanel);

    fetch("scripts/data.json")
        .then(function(res) { return res.json() })
        .then(initChart);

    return {
        root
    };

};