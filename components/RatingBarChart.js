import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from '../styles/Home.module.css';

const RATING_ORDER = [
  'Overwhelmingly Negative',
  'Very Negative',
  'Mostly Negative',
  'Mixed',
  'Mostly Positive',
  'Very Positive',
  'Overwhelmingly Positive',
];

export default function RatingBarChart({ year, ratingMap }) {
  const ref = useRef();

  useEffect(() => {
    if (!ratingMap || Object.keys(ratingMap).length === 0) return;

    // Tooltip
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

    const data = RATING_ORDER.map((r, i) => ({
      rating: r,
      count: +ratingMap[r] || 0,
      order: i,
    }));

    const width = 700;
    const height = 607;
    const margin = { top: 85, right: 20, bottom: 160, left: 110 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const x = d3.scaleBand()
      .domain(data.map(d => d.rating))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const maxCount = d3.max(data, d => d.count);
    const tickStep = Math.max(1, Math.ceil(maxCount / 5));
    const ticks = d3.range(0, maxCount + 1, tickStep);

    const color = d3.scaleSequential()
      .domain([0, RATING_ORDER.length - 1])
      .interpolator(d3.interpolateBlues);

    // Bars + Tooltip Events
    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.rating))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.count))
      .attr("fill", d => color(d.order))
      .attr("rx", 5)
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.rating}</strong><br/>${d.count} releases`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("font-size", "16px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");

    svg.append("text")
      .attr("x", 390)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .text("Positive Rating");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickValues(ticks).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("font-size", "16px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif");

    svg.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2 + 40)
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .text("Number of Releases");

    // Title
    svg.append("text")
      .attr("x", 373)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "bold")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .text(`${year} Ratings Distribution`);

    return () => tooltip.remove();
  }, [ratingMap, year]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContent}>
        <svg ref={ref} width={700} height={607} />
      </div>
    </div>
  );
}