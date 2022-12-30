// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function constructLineGenerator(xScale, yScale) {
    return d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value))
        .defined(d => !isNaN(d.value));
}

function constructLabel(title) {
    return d3.create("svg:text")
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("font-size", "1.75em")
        .text(title);
}

function constructLine(stroke, lineGenerator, data) {
    return d3.create("svg:path")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("stroke-opacity", 1)
        .attr("d", lineGenerator(data));
}

function aqiChart(aqiData, tempData, {
    marginTop = 20, // top margin, in pixels
    marginRight = 75, // right margin, in pixels
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
        const aqiLine = constructLineGenerator(xScale, aqiYScale);
        const tempLine = constructLineGenerator(xScale, tempYScale);

        // Construct chart svg.
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("role", "img")
            .attr("aria-label", "Chart of AQI and Temperature values over the past 24 hours.");

        // Construct labels.
        const aqiLabel = constructLabel("AQI");
        const tempLabel = constructLabel("Temperature (C)");

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
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${-marginLeft / 2}, ${height / 2}), rotate(270)`)
                .append(() => aqiLabel.node()));

        // Render Temp Y axis.
        svg.append("g")
            .attr("transform", `translate(${width - marginRight},0)`)
            .call(tempYAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.append("g")
                .attr("transform", `translate(${marginRight / 2}, ${height / 2}), rotate(270)`)
                .append(() => tempLabel.node()));

        // Render graph data.
        svg.append(() => constructLine("red", aqiLine, aqiData).node());
        svg.append(() => constructLine("blue", tempLine, tempData).node());

        return svg.node();
}

export default aqiChart;