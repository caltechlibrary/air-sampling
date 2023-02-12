// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.7.0/+esm";

function pollutantChart(data, {
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
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

        // Compute default ranges.
        const xRange = [marginLeft, width - marginRight];
        const yRange = [height - marginBottom, marginTop];

        const customTimeFormat = date => date.toLocaleString("en-US", { timeZone: "America/Los_Angeles", timeStyle: "short" })

        // Construct scales and axes.
        const xScale = d3.scaleTime(xDomain, xRange);
        const yScale = d3.scaleLinear(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).tickFormat((xTick, i) => i % 2 == 0 ? customTimeFormat(xTick) : "");
        const yAxis = d3.axisLeft(yScale).ticks(3).tickSize(0);

        // Extract pollutant checmical and subscript
        const [pollutantChem, pollutantSub] = pollutant.split(/(\d.*)/, 2);

        // Construct a line generator.
        const line = d3.line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.value))
            .defined(d => !isNaN(d.value));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("role", "img")
            .attr("aria-label", `Chart of recent ${pollutant} values.`);

        // Construct chart label
        const label = d3.create("svg:text")
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .attr("font-size", "1.75em")
            .text(pollutantChem)
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
                .attr("y2", marginTop + marginBottom - height)
                .attr("stroke-opacity", 0.1));

        // Render y axis.
        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick text")
                .attr("font-size", "1.5em"))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("g")
                .attr("transform", `translate(${-marginLeft / 2}, ${height / 2}), rotate(270)`)
                    .append(() => label.node()));

        // Render graph data.
        svg.append("path")
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("stroke-opacity", 1)
            .attr("d", line(data));

        return svg.node();
}

export default pollutantChart;