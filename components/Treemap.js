import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import styles from "../styles/Home.module.css";

const Legend = ({ genres, colorScale }) => {
  const ref = useRef();

  useEffect(() => {
    if (!genres || genres.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const itemWidth = 120;

    svg.selectAll("g")
      .data(genres)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${i * itemWidth}, 10)`)
      .each(function (d) {
        const g = d3.select(this);
        g.append("rect")
          .attr("width", 16)
          .attr("height", 16)
          .attr("fill", colorScale(d));

        g.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("dy", "2px")
          .attr("font-size", "16px")
          .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
          .text(d);
      });
  }, [genres, colorScale]);

  return (
    <div style={{ marginTop: "-5px", marginLeft: "4px"}}>
      <h4 style={{
        marginBottom: "5px",
        fontFamily: "Segoe UI, Helvetica Neue, sans-serif",
        fontSize: "20px"
      }}>Legend</h4>
      <svg ref={ref} width={600} height={30}></svg>
    </div>
  );
};

const Treemap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 700;
    const chartHeight = 450;
    const extraTopSpace = 70;
    const totalHeight = chartHeight + extraTopSpace;

    const allGenres = ["Action", "RPG", "Simulation", "Strategy", "Casual", "Other"];
    const colorScale = d3.scaleOrdinal()
      .domain(allGenres)
      .range(d3.schemeCategory10);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = d3.hierarchy({ children: data }).sum(d => d.count);
    d3.treemap().size([width, chartHeight]).padding(4)(root);

    svg.append("text")
      .attr("x", 365)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "bold")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .text("Genre Distribution");

    const nodes = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0}, ${d.y0 + extraTopSpace})`);

    nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colorScale(d.data.genre))
      .attr("rx", 6);

    nodes.append("text")
      .attr("x", 6)
      .attr("y", 18)
      .attr("fill", "#fff")
      .attr("font-size", "16px")
      .attr("font-family", "Segoe UI, Helvetica Neue, sans-serif")
      .style("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.6)")
      .text(d => `${d.data.genre} (${d.data.percent || ""})`);
  }, [data]);

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartContent}>
        <svg ref={svgRef} width={700} height={520}></svg>
        <Legend genres={["Action", "RPG", "Simulation", "Strategy", "Casual", "Other"]} colorScale={
          d3.scaleOrdinal().domain(["Action", "RPG", "Simulation", "Strategy", "Casual", "Other"]).range(d3.schemeCategory10)
        } />
      </div>
    </div>
  );
};

export default Treemap;