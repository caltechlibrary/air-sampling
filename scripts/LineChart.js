// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart
function LineChart(data, {
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 75, // left margin, in pixels
    width, // outer width, in pixels
    height, // outer height, in pixels`
    label, // a label for the y-axis
    color // stroke color of line
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

        // Construct scales and axes.
        const xScale = d3.scaleTime(xDomain, xRange);
        const yScale = d3.scaleLinear(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d %I %p"));
        const yAxis = d3.axisLeft(yScale).ticks(3).tickSize(0);

        // Construct a line generator.
        const line = d3.line()
            .x(d => xScale(d.time))
            .y(d => yScale(d.value))
            .defined(d => !isNaN(d.value));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height]);
        
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
                    .append("text")
                        .attr("text-anchor", "middle")
                        .attr("fill", "currentColor")
                        .attr("font-size", "1.75em")
                        .text(label));

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