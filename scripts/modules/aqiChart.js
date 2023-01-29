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

function constructAreaGenerator(xScale, yScale) {
    return d3.area()
        .x(d => xScale(d.time))
        .y0(d => yScale(d.lower))
        .y1(d => yScale(d.upper))
        .defined(d => !isNaN(d.lower) && !isNaN(d.upper));
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

function constructArea(color, areaGenerator, lowerData, upperData) {
    const data = lowerData.map((d, i) => ({
        time: d.time,
        lower: d.value,
        upper: upperData[i].value
    }));

    return d3.create("svg:path")
        .attr("fill", color)
        .attr("opacity", 0.2)
        .attr("d", areaGenerator(data));
}

function aqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper, {
    marginTop = 20, // top margin, in pixels
    marginRight = 75, // right margin, in pixels
    marginBottom = 60, // bottom margin, in pixels
    marginLeft = 75, // left margin, in pixels
    width = 1000, // outer width, in pixels
    height = 270, // outer height, in pixels
    aqiColor = "#eb0000", // color of aqi data line
    tempColor = "#0000ff" // color of temp data line
    } = {}) {

        // Compute values.
        const aqiY = d3.map(aqiData, d => d.value);
        const tempY = d3.map(tempData, d => d.value);

        // Compute default domains.
        const xDomain = [new Date().setHours(0,0,0,0), new Date().setHours(24,0,0,0)];
        const aqiYDomain = [d3.min(aqiY), d3.max(aqiY) + 10];
        const tempYDomain = [d3.min(tempY) - 10, d3.max(tempY) + 5];

        // Compute dimensions of graph area
        const graphWidth = width - marginLeft - marginRight;
        const graphHeight = height - marginBottom - marginTop;

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const aqiYRange = [height - marginBottom, marginTop + (graphHeight / 3)];
        const tempYRange = [marginTop + (graphHeight / 1.5), marginTop];

        // Construct scales.
        const xScale = d3.scaleTime(xDomain, xRange);
        const aqiYScale = d3.scaleLinear(aqiYDomain, aqiYRange);
        const tempYScale = d3.scaleLinear(tempYDomain, tempYRange);

        // Construct axes.
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%-H"));
        const aqiYAxis = d3.axisLeft(aqiYScale).ticks(5);
        const tempYAxis = d3.axisRight(tempYScale).ticks(5);

        // Construct line generators.
        const aqiLine = constructLineGenerator(xScale, aqiYScale);
        const tempLine = constructLineGenerator(xScale, tempYScale);

        // Construct area graph generators.
        const aqiArea = constructAreaGenerator(xScale, aqiYScale);
        const tempArea = constructAreaGenerator(xScale, tempYScale);

        // Construct chart svg.
        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("role", "img")
            .attr("aria-label", "Chart of AQI and Temperature values over the past 24 hours.");

        // Construct labels.
        const xLabel = constructLabel("Local Time of Day (hrs)");
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
                .attr("y2", -graphHeight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${width / 2},${marginBottom / 1.33})`)
                .append(() => xLabel.node()));

        // Render AQI Y axis.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(aqiYAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("fill", aqiColor)
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line")
                .attr("stroke", aqiColor))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", graphWidth)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${-marginLeft / 2}, ${marginTop + (graphHeight / 2)}), rotate(270)`)
                .append(() => aqiLabel.node())
                    .attr("fill", aqiColor));

        // Render Temp Y axis.
        svg.append("g")
            .attr("transform", `translate(${width - marginRight},0)`)
            .call(tempYAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("fill", tempColor)
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line")
                .attr("stroke", tempColor))
            .call(g => g.append("g")
                .attr("transform", `translate(${marginRight / 1.5}, ${marginTop + (graphHeight / 2)}), rotate(270)`)
                .append(() => tempLabel.node())
                    .attr("fill", tempColor));

        // Render legend
        svg.append("g")
            .attr("transform", `translate(${marginLeft + (graphWidth / 4)}, 0)`)
            .attr("font-size", "0.75em")
            .attr("font-family", "sans-serif")
            .call(g => g.append("rect")
                .attr("height", 20)
                .attr("width", graphWidth / 1.33)
                .attr("fill", "#fff")
                .attr("stroke", "#000"))
            .call(g => g.append("rect")
                .attr("x", 5)
                .attr("y", 3.5)
                .attr("height", 13)
                .attr("width", "40")
                .attr("fill", aqiColor))
            .call(g => g.append("text")
                .attr("x", 50)
                .attr("y", 10)
                .attr("alignment-baseline", "middle")
                .text("Previous 7 day AQI"))
            .call(g => g.append("rect")
                .attr("x", 165)
                .attr("y", 9)
                .attr("height", 2)
                .attr("width", "40")
                .attr("fill", aqiColor))
            .call(g => g.append("text")
                .attr("x", 210)
                .attr("y", 10)
                .attr("alignment-baseline", "middle")
                .text("Current day AQI"))
            .call(g => g.append("rect")
                .attr("x", 310)
                .attr("y", 3.5)
                .attr("height", 13)
                .attr("width", "40")
                .attr("fill", tempColor))
            .call(g => g.append("text")
                .attr("x", 355)
                .attr("y", 10)
                .attr("alignment-baseline", "middle")
                .text("Previous 7 day Temp"))
            .call(g => g.append("rect")
                .attr("x", 480)
                .attr("y", 9)
                .attr("height", 2)
                .attr("width", "40")
                .attr("fill", tempColor))
            .call(g => g.append("text")
                .attr("x", 525)
                .attr("y", 10)
                .attr("alignment-baseline", "middle")
                .text("Current day Temp"))
        

        // Render graph data.
        svg.append(() => constructLine(aqiColor, aqiLine, aqiData).node());
        svg.append(() => constructLine(tempColor, tempLine, tempData).node());

        // Render area graph data.
        svg.append(() => constructArea(aqiColor, aqiArea, aqiDataLower, aqiDataUpper).node());
        svg.append(() => constructArea(tempColor, tempArea, tempDataLower, tempDataUpper).node());

        return svg.node();
}

export default aqiChart;