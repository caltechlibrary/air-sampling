// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function aqiChart(aqiData, tempData, {
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 75, // left margin, in pixels
    width = 1000, // outer width, in pixels
    height = 270, // outer height, in pixels`
    } = {}) {

        // Compute values.
        const aqiY = d3.map(aqiData, d => d.value);
        const tempY = d3.map(tempData, d => d.value);

        // Compute default domains.
        const xDomain = [new Date().setHours(0,0,0,0), new Date().setHours(24,0,0,0)];
        const aqiYDomain = [d3.min(aqiY), d3.max(aqiY)];
        const tempYDomain = [d3.min(tempY), d3.max(tempY)];

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const aqiYRange = [height - marginBottom, marginTop + (height / 3)];
        const tempYRange = [(height * 0.66) - marginBottom, marginTop];

        // Construct scales and axes.
        const xScale = d3.scaleTime(xDomain, xRange);
        const aqiYScale = d3.scaleLinear(aqiYDomain, aqiYRange);
        const tempYScale = d3.scaleLinear(tempYDomain, tempYRange);
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%-H"));
        const aqiYAxis = d3.axisLeft(aqiYScale).ticks(5);
        const tempYAxis = d3.axisRight(tempYScale).ticks(5);

        // Construct line generators.
        const aqiLine = d3.line()
            .x(d => xScale(d.time))
            .y(d => aqiYScale(d.value))
            .defined(d => !isNaN(d.value));
        const tempLine = d3.line()
            .x(d => xScale(d.time))
            .y(d => tempYScale(d.value))
            .defined(d => !isNaN(d.value));

        // Construct chart svg.
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("role", "img")
            .attr("aria-label", "Chart of AQI and Temperature values over the past 24 hours.");

        // Render x axis.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line").clone()
                .attr("y2", marginTop + marginBottom - height)
                .attr("stroke-opacity", 0.1));

        // Render AQI Y axis.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(aqiYAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1));

        // Render Temp Y axis.
        svg.append("g")
            .attr("transform", `translate(${width - marginRight},0)`)
            .call(tempYAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line").clone()
                .attr("transform", `translate(${marginRight - width + marginLeft},0)`)
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1));

        // Render AQI graph data.
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-opacity", 1)
            .attr("d", aqiLine(aqiData));

        // Render Temperature graph data.
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-opacity", 1)
            .attr("d", tempLine(tempData));

        return svg.node();
}

export default aqiChart;