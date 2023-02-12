// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";
import * as luxon from "https://cdn.jsdelivr.net/npm/luxon@3.2.1/+esm"

function computeGraphAreaDimensions(height, width, marginTop, marginRight, marginBottom, marginLeft) {
    const graphWidth = width - marginLeft - marginRight;
    const graphHeight = height - marginBottom - marginTop;

    return { graphWidth, graphHeight }
}

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

function constructChartSvg(height, width, label) {
    return d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("role", "img")
            .attr("aria-label", label);
}

function constructLabel(title) {
    return d3.create("svg:text")
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("font-size", "1.75em")
        .text(title);
}

function constructLegendSquare(x, y, height, width, fill) {
    return d3.create("svg:rect")
        .attr("x", x)
        .attr("y", y)
        .attr("height", height)
        .attr("width", width)
        .attr("fill", fill);
}

function constructLegendText(x, y, text) {
    return d3.create("svg:text")
        .attr("x", x)
        .attr("y", y)
        .attr("alignment-baseline", "middle")
        .text(text);
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

export function pollutantChart(data, {
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 60, // bottom margin, in pixels
    marginLeft = 75, // left margin, in pixels
    width = 1000, // outer width, in pixels
    height = 270, // outer height, in pixels`
    color = "black", // stroke color of line
    pollutant, // chart pollutant
    unit, // chart unit
    } = {}) {

        // Compute values.
        const X = d3.map(data, d => d.time);
        const Y = d3.map(data, d => d.value);

        // Compute default domains.
        const xDomain = d3.extent(X);
        const yDomain = [d3.min(Y) - 0.5, d3.max(Y) + 0.5];

        // Computer dimensions of graph area
        const { graphWidth, graphHeight } = computeGraphAreaDimensions(height, width, marginTop, marginRight, marginBottom, marginLeft);

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const yRange = [height - marginBottom, marginTop];

        // Construct scales.
        const xScale = d3.scaleTime(xDomain, xRange);
        const yScale = d3.scaleLinear(yDomain, yRange);

        // Construct custom time format.
        const customTimeFormat = date => date.toLocaleString("en-US", { timeZone: "America/Los_Angeles", timeStyle: "short" });

        // Construct axes.
        const xAxis = d3.axisBottom(xScale).tickFormat((xTick, i) => i % 2 == 0 ? customTimeFormat(xTick) : "");
        const yAxis = d3.axisLeft(yScale).ticks(3).tickSize(0);

        // Construct a line generator.
        const line = constructLineGenerator(xScale, yScale);

        // Construct chart svg
        const svg = constructChartSvg(height, width, `Chart of recent ${pollutant} values.`);

        // Extract pollutant checmical and subscript
        const [pollutantChem, pollutantSub] = pollutant.split(/(\d.*)/, 2);
        
        // Construct chart labels
        const labelX = constructLabel("Local time Los Angeles")
        const labelY = constructLabel(pollutantChem)
            .call(t => t.append("tspan")
                .attr("baseline-shift", "sub")
                .text(pollutantSub))
            .call(t => t.append("tspan")
                .attr("dx", "8px")
                .text(`(${unit})`));
        
        // Render x axis.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick:nth-child(even) line")
                .attr("y2", 0))
            .call(g => g.selectAll(".tick line").clone()
                .attr("y2", -graphHeight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${width / 2}, ${marginBottom / 1.33})`)
                    .append(() => labelX.node()));

        // Render y axis.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", graphWidth)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${-marginLeft / 2}, ${height / 2}), rotate(270)`)
                    .append(() => labelY.node()));

        // Render graph data.
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-opacity", 1)
            .attr("d", line(data));

        svg.append(() => constructLine(color, line, data).node());

        return svg.node();
}

export function aqiChart(aqiData, aqiDataLower, aqiDataUpper, tempData, tempDataLower, tempDataUpper, {
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
        const xDomain = [
            luxon.DateTime.fromObject({hour: 0}, { zone: "America/Los_Angeles" }).toJSDate(), 
            luxon.DateTime.fromObject({hour: 24}, { zone: "America/Los_Angeles" }).toJSDate()
        ];
        const aqiYDomain = [d3.min(aqiY), d3.max(aqiY) + 10];
        const tempYDomain = [d3.min(tempY) - 10, d3.max(tempY) + 5];

        // Compute dimensions of graph area
        const { graphWidth, graphHeight } = computeGraphAreaDimensions(height, width, marginTop, marginRight, marginBottom, marginLeft);

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const aqiYRange = [height - marginBottom, marginTop + (graphHeight / 3)];
        const tempYRange = [marginTop + (graphHeight / 1.5), marginTop];

        // Construct scales.
        const xScale = d3.scaleTime(xDomain, xRange);
        const aqiYScale = d3.scaleLinear(aqiYDomain, aqiYRange);
        const tempYScale = d3.scaleLinear(tempYDomain, tempYRange);

        // Construct custom time format.
        const customTimeFormat = date => date.toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour12: false, hour: "numeric" });

        // Construct axes.
        const xAxis = d3.axisBottom(xScale).tickFormat(customTimeFormat);
        const aqiYAxis = d3.axisLeft(aqiYScale).ticks(5);
        const tempYAxis = d3.axisRight(tempYScale).ticks(5);

        // Construct line generators.
        const aqiLine = constructLineGenerator(xScale, aqiYScale);
        const tempLine = constructLineGenerator(xScale, tempYScale);

        // Construct area graph generators.
        const aqiArea = constructAreaGenerator(xScale, aqiYScale);
        const tempArea = constructAreaGenerator(xScale, tempYScale);

        // Construct chart svg.
        const svg = constructChartSvg(height, width, "Chart of AQI and Temperature values over the past 24 hours.");

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
            .call(g => g.append(() => constructLegendSquare(5, 3.5, 13, 40, aqiColor).node()))
            .call(g => g.append(() => constructLegendText(50, 10, "Previous 7 day AQI").node()))
            .call(g => g.append(() => constructLegendSquare(165, 9, 2, 40, aqiColor).node()))
            .call(g => g.append(() => constructLegendText(210, 10, "Current day AQI").node()))
            .call(g => g.append(() => constructLegendSquare(310, 3.5, 13, 40, tempColor).node()))
            .call(g => g.append(() => constructLegendText(355, 10, "Previous 7 day Temp").node()))
            .call(g => g.append(() => constructLegendSquare(480, 9, 2, 40, tempColor).node()))
            .call(g => g.append(() => constructLegendText(525, 10, "Current day Temp").node()));
        

        // Render graph data.
        svg.append(() => constructLine(aqiColor, aqiLine, aqiData).node());
        svg.append(() => constructLine(tempColor, tempLine, tempData).node());

        // Render area graph data.
        svg.append(() => constructArea(aqiColor, aqiArea, aqiDataLower, aqiDataUpper).node());
        svg.append(() => constructArea(tempColor, tempArea, tempDataLower, tempDataUpper).node());

        return svg.node();
}