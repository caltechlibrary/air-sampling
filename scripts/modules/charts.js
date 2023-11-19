// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function getXDomain() {
    const prevMidnight = new Date();
    prevMidnight.setHours(0, 0, 0, 0);
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);

    return [prevMidnight, nextMidnight];
}

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

function constructLabel(title, fontSize) {
    return d3.create("svg:text")
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("font-size", fontSize)
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

function constructArea(color, areaGenerator, bandsData) {
    return d3.create("svg:path")
        .attr("fill", color)
        .attr("opacity", 0.2)
        .attr("d", areaGenerator(bandsData));
}

export function pollutantChart(data, bandsData, {
    width = 1000, // outer width, in pixels
    height = 270, // outer height, in pixels`
    color = "black", // stroke color of line
    pollutant, // chart pollutant
    unit, // chart unit
    } = {}) {

        // Compute all values for domain calculation.
        const Y = [...d3.map(data, d => d.value), ...d3.map(bandsData, d => d.lower), ...d3.map(bandsData, d => d.upper)];

        // Compute default domains.
        const xDomain = getXDomain();
        const yDomain = [d3.min(Y) - 0.5, d3.max(Y) + 0.5];

        // Compute graph boundaries.
        const marginLeft = height > 200 ? 75 : 50;
        const marginRight = 20;
        const marginTop = 20;
        const marginBottom = height > 200 ? 60 : 40;

        // Compute dimensions of graph area
        const { graphWidth, graphHeight } = computeGraphAreaDimensions(height, width, marginTop, marginRight, marginBottom, marginLeft);

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const yRange = [height - marginBottom, marginTop];

        // Compute number of x axis ticks 
        const xTicks = Math.min(width / 100, 6);

        // Compute axis font size
        const axisFontSize =  height > 200 ? "1.5em" : "1em";

        // Compute label font size
        const labelFontSize = height > 200 ? "1.75em" : "1em";

        // Construct scales.
        const xScale = d3.scaleTime(xDomain, xRange);
        const yScale = d3.scaleLinear(yDomain, yRange);

        // Construct custom time format.
        const customTimeFormat = date => date.toLocaleString("en-US", { hour12: false, hour: "numeric" });

        // Construct axes.
        const xAxis = d3.axisBottom(xScale).tickFormat(customTimeFormat).ticks(xTicks);
        const yAxis = d3.axisLeft(yScale).ticks(3).tickSize(0);

        // Construct a line generator.
        const line = constructLineGenerator(xScale, yScale);

        // Construct an area generator.
        const area = constructAreaGenerator(xScale, yScale);

        // Construct chart svg
        const svg = constructChartSvg(height, width, `Chart of recent ${pollutant} values.`);

        // Extract pollutant checmical and subscript
        const [pollutantChem, pollutantSub] = pollutant.split(/(\d.*)/, 2);
        
        // Construct chart labels
        const labelX = constructLabel("Local Time Los Angeles (hrs)", labelFontSize)
        const labelY = constructLabel(pollutantChem, labelFontSize)
            .call(t => t.append("tspan")
                .attr("dy", "5px")
                .text(pollutantSub))
            .call(t => t.append("tspan")
                .attr("dy", "-5px")
                .attr("dx", "8px")
                .text(`(${unit})`));
        
        // Render x axis.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", axisFontSize))
            .call(g => g.selectAll(".tick:nth-child(even) line").size() > 1 && g.selectAll(".tick:nth-child(even) line")
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
                .attr("font-size", axisFontSize))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", graphWidth)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${-marginLeft / 2}, ${height / 2}), rotate(270)`)
                    .append(() => labelY.node()));

        // Render graph data.
        svg.append(() => constructLine(color, line, data).node());

        // Render area graph data.
        svg.append(() => constructArea(color, area, bandsData).node());

        return svg.node();
}

export function aqiChart(aqiData, aqiBandsData, tempData, tempBandsData, {
    width = 1000, // outer width, in pixels
    height = 270, // outer height, in pixels
    aqiColor = "#eb0000", // color of aqi data line
    tempColor = "#0000ff" // color of temp data line
    } = {}) {

        // Compute all values for domain calculation.
        const aqiY = [...d3.map(aqiData, d => d.value), ...d3.map(aqiBandsData, d => d.lower), ...d3.map(aqiBandsData, d => d.upper)];
        const tempY = [...d3.map(tempData, d => d.value), ...d3.map(tempBandsData, d => d.lower), ...d3.map(tempBandsData, d => d.upper)];

        // Compute default domains.
        const xDomain = getXDomain();
        const aqiYDomain = [d3.min(aqiY) - 5, d3.max(aqiY) + 10];
        const tempYDomain = [d3.min(tempY) - 10, d3.max(tempY) + 5];

        // Compute graph boundaries
        const marginLeft = width > 600 ? 75 : 50;
        const marginRight = width > 600 ? 75 : 50;
        const marginTop = 20;
        const marginBottom = width > 600 ? 60 : 40;

        // Compute dimensions of graph area
        const { graphWidth, graphHeight } = computeGraphAreaDimensions(height, width, marginTop, marginRight, marginBottom, marginLeft);

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const aqiYRange = [height - marginBottom, marginTop + (graphHeight / 3)];
        const tempYRange = [marginTop + (graphHeight / 1.5), marginTop];

        // Compute number of x axis ticks
        const xTicks = Math.min(width / 100, 6);

        // Compute axis font size
        const axisFontSize = width > 600 ? "1.5em" : "1em";

        // Compute label font size
        const labelFontSize = width > 600 ? "1.75em" : "1em";

        // Construct scales.
        const xScale = d3.scaleTime(xDomain, xRange);
        const aqiYScale = d3.scaleLinear(aqiYDomain, aqiYRange);
        const tempYScale = d3.scaleLinear(tempYDomain, tempYRange);

        // Construct custom time format.
        const customTimeFormat = date => date.toLocaleString("en-US", { hour12: false, hour: "numeric" });

        // Construct axes.
        const xAxis = d3.axisBottom(xScale).tickFormat(customTimeFormat).ticks(xTicks);
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
        const xLabel = constructLabel("Local Time Los Angeles (hrs)", labelFontSize);
        const aqiLabel = constructLabel("AQI", labelFontSize);
        const tempLabel = constructLabel("Temperature (C)", labelFontSize);

        // Render x axis.
        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", axisFontSize))
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
                .attr("font-size", axisFontSize))
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
                .attr("font-size", axisFontSize))
            .call(g => g.selectAll(".tick line")
                .attr("stroke", tempColor))
            .call(g => g.append("g")
                .attr("transform", `translate(${marginRight / 1.5}, ${marginTop + (graphHeight / 2)}), rotate(270)`)
                .append(() => tempLabel.node())
                    .attr("fill", tempColor));       

        // Render graph data.
        svg.append(() => constructLine(aqiColor, aqiLine, aqiData).node());
        svg.append(() => constructLine(tempColor, tempLine, tempData).node());

        // Render area graph data.
        svg.append(() => constructArea(aqiColor, aqiArea, aqiBandsData).node());
        svg.append(() => constructArea(tempColor, tempArea, tempBandsData).node());

        return svg.node();
}