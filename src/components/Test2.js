import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import dataSet from "./data";

const App = () => {
  const margin = { top: 50, bottom: 50, left: 50, right: 50 };
  const width = 500;
  const height = 400;

  const graphContainer = useRef(null);

  const [data, dataUpdater] = useState(dataSet);

  const calcMaxTime = () =>
    Math.max.apply(
      Math,
      data.map(function(o) {
        return o.t;
      })
    );
  const calcMaxP = () =>
    Math.max.apply(
      Math,
      data.map(function(o) {
        return o.p;
      })
    );
  const calcMinTime = () =>
    Math.min.apply(
      Math,
      data.map(function(o) {
        return o.t;
      })
    );
  const [maxTime, maxTimeUpdater] = useState(calcMaxTime());
  const [maxP, maxPUpdater] = useState(calcMaxP());
  const [minTime, minTimeUpdater] = useState(calcMinTime());

  const [xScale, updateXScale] = useState(() =>
    d3
      .scaleLinear()
      .domain([minTime, maxTime])
      .range([0, width])
  );
  const [yScale, updateYScale] = useState(() =>
    d3
      .scaleLinear()
      .domain([0, maxP])
      .range([height, 0])
  );
  const newDataPoint = {
    p: 50,
    l: 49,
    j: 46,
    t: 6
  };
  const addDataPoint = () => {
    dataUpdater(data.shift(1));
    dataUpdater([...data, newDataPoint]);

    updateGraph();
  };
  const updateGraph = () => {
    minTimeUpdater(() => calcMinTime());
    maxTimeUpdater(() => calcMaxTime());
    maxPUpdater(() => calcMaxP());
    console.log(maxP);
    updateXScale(() =>
    d3
      .scaleLinear()
      .domain([minTime, maxTime])
      .range([0, width])
    );
    updateYScale(() =>
    d3
      .scaleLinear()
      .domain([0, maxP])
      .range([height, 0])
    );
    const line = d3
      .line()
      .x(function(d, i) {
        return xScale(d.t);
      }) // set the x values for the line generator
      .y(function(d) {
        return yScale(d.p);
      }) // set the y values for the line generator
      .curve(d3.curveMonotoneX); // apply smoothing to the line

    const path = d3.select(".line")
      .datum(data)
      .attr("d", line);

    const xAxis = d3.select(".x-axis")
      .call(d3.axisBottom(xScale))

    const yAxis = d3.select(".y-axis")
      .call(d3.axisLeft(yScale))
  };
  useEffect(() => {
    if (graphContainer.current) {
      const line = d3
        .line()
        .x(function(d, i) {
          return xScale(d.t);
        }) // set the x values for the line generator
        .y(function(d) {
          return yScale(d.p);
        }) // set the y values for the line generator
        .curve(d3.curveMonotoneX); // apply smoothing to the line

      const svg = d3
        .select(graphContainer.current)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
      svg
        .append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
      svg
        .append("path")
        .datum(data)
        .attr("class", "line") // Assign a class for styling
        .attr("d", line); // 11. Calls the line generator
      svg
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d, i) {
          return xScale(d.t);
        })
        .attr("cy", function(d) {
          return yScale(d.p);
        })
        .attr("r", 5)
        .on("mouseover", function(a, b, c) {
          console.log(a);
          this.attr("class", "focus");
        })
        .on("mouseout", function() {});
    }
  }, []);



  return (
    <div className="body">
      <span>minTime: {minTime} </span>
      <span>maxTime: {maxTime} </span>
      <span>maxP: {maxP} </span>
      <button onClick={addDataPoint}>Click to add datapoint</button>
      <button
        onClick={() => {
          console.log(data);
        }}
      >
        Click to print data
      </button>
      <svg
        className="d3-component"
        width={600}
        height={500}
        ref={graphContainer}
      />
    </div>
  )
}
export default App
