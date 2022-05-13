let MetricChart = function(root, metricData) {

    let metric = root.getAttribute("data-metric");
    let chartSVG = LineChart(metricData.data, {
        width: 1000,
        height: 270,
        label: `${metric} ${metricData.unit}`,
        color: "black"
    });
    
    chartSVG.classList.add("metric-chart__svg");
    root.appendChild(chartSVG);

};