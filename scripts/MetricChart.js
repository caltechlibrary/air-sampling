let MetricChart = function(root, data) {

    let metric = root.getAttribute("data-metric");
    let chartSVG = LineChart(data, {
        width: 1000,
        height: 270,
        label: `${metric} ug m\u207B\u00B3`,
        color: "black"
    });
    
    chartSVG.classList.add("metric-chart__svg");
    root.appendChild(chartSVG);

};