import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../styles/Home.module.css';

export default function GameReleasesChart({ gamesByYear, onYearClick }) {
  const ref = useRef();

  useEffect(() => {
    if (!gamesByYear || Object.keys(gamesByYear).length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const data = Object.entries(gamesByYear).map(([year, count]) => ({
      year: +year,
      count: +count
    })).sort((a, b) => a.year - b.year);

    const width = 1400;
    const height = 600;
    const margin = { top: 80, right: 150, bottom: 70, left: 160 };

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#5B9BD5")
      .attr("stroke-width", 4)
      .attr("d", line);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("font-size", "20px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("font-size", "20px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif");

    // 添加 tooltip
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "6px 10px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("font-size", "14px")
      .style("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 6px rgba(0,0,0,0.1)")
      .style("opacity", 0);

    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.count))
      .attr("r", 6)
      .attr("fill", "#2E75B6")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onYearClick) onYearClick(d.year);
      })
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.year}</strong><br/>${d.count} releases`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "bold")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .text("Game Releases Per Year");

    return () => tooltip.remove();
  }, [gamesByYear, onYearClick]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContent}>
        <svg ref={ref} width={1400} height={600} />
      </div>
    </div>
  );
}