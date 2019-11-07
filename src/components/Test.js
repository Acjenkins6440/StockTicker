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
  const newDataPoint = {
    p: 18,
    l: 49,
    j: 46,
    t: 6
  };

  const [maxTime, maxTimeUpdater] = useState(calcMaxTime());
  const [maxP, maxPUpdater] = useState(calcMaxP());
  const [minTime, minTimeUpdater] = useState(calcMinTime());

  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom().scale(xScale);
  const yAxis = d3.axisLeft().scale(yScale);

  xScale.domain([
    d3.min(data, () => minTime),
    d3.max(data, () => maxTime)
  ]);

  yScale.domain([
    d3.min(data, (d) => (d.p - 10 < 0) ? 0 : d.p - 10),
    d3.max(data, (d) => d.p + 10)
  ]);

  const line = d3.line();

  const svg = d3.select(".d3-component");

  const drawChart = () => {
    xScale.domain([
      d3.min(data, () => minTime),
      d3.max(data, () => maxTime)
    ]);

    xAxis.scale(xScale);
    const xAxisEl = svg.select(".xAxisEl")
      .call(xAxis);

    line.x((d) => xScale(d.t))
    .y((d) => yScale(d.p))
    .curve(d3.curveMonotoneX);

    const path = svg.select("data-path")
      .attr('d', line);
  }

  drawChart();

  const addDataPoint = () => {
    dataUpdater(data.shift(0));
    dataUpdater([...data, newDataPoint]);
  };

  const updateGraph = () => {
    minTimeUpdater(() => calcMinTime());
    maxTimeUpdater(() => calcMaxTime());
    maxPUpdater(() => calcMaxP());
  };

  useEffect(() => {
    if (graphContainer.current) {
      const space = svg.append("g")
          .attr("class", "space")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const path = space.append("path")
        .attr("class", "data-path")
        .data([data])
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .style('stroke-width', '2px');

      const xAxisEl = space.append("g")
        .attr("class", "xAxisEl")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      const yAxisEl = space.append("g")
        .attr("class", yAxisEl)
        .call(yAxis);
  }
}, []);



  return (
    <div className="body">
      <span>minTime: {minTime} </span>
      <span>maxTime: {maxTime}</span>
      <button onClick={addDataPoint}>Click to add datapoint</button>
      <button
        onClick={() => {
          console.log(data);
        }}
      >
        Click to print data
      </button>
      <svg className="d3-component" width={600} height={500} ref={graphContainer}/>
    </div>
  )
}

export default App;
