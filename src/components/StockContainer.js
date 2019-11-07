import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import StockDisplay from './StockDisplay';
import * as d3 from 'd3';

const StockContainer = ({ endPoint, symbol }) => {
  const margin = { top: 50, bottom: 50, left: 50, right: 50 };
  const width = 500;
  const height = 400;
  const graphContainer = useRef(null);
  const [dataSet, updateDataSet] = useState([]);
  const dataPoint = (dataSet.length) ? dataSet[dataSet.length - 1].p : 0;
  const handleNewData = (stockData) => {
    const price = stockData.p;
    if (price !== dataPoint) {
      if (dataSet.length < 10) {
        updateDataSet([...dataSet, stockData]);
      } else {
        updateDataSet([...dataSet.slice(1), stockData]);
      }
    }
  };
  console.log(dataSet);
  useEffect(() => {
    //adding websocket listeners and building graph
    const socket = new WebSocket(endPoint);
    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({ type: 'subscribe', symbol }),
      );
    });
    socket.addEventListener('message', (event) => {
      const eventData = JSON.parse(event.data);
      const stockData = eventData.data[0];
      handleNewData(stockData);
    });})
  //   const line = d3
  //     .line()
  //     .x(function(d, i) {
  //       return xScale(d.t);
  //     }) // set the x values for the line generator
  //     .y(function(d) {
  //       return yScale(d.p);
  //     }) // set the y values for the line generator
  //     .curve(d3.curveMonotoneX); // apply smoothing to the line
  //
  //   const svg = d3
  //     .select(".stock-graph")
  //     .append("g")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //   svg
  //     .append("g")
  //     .attr("class", "x-axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
  //   svg
  //     .append("g")
  //     .attr("class", "y-axis")
  //     .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
  //   svg
  //     .append("path")
  //     .datum(data)
  //     .attr("class", "line") // Assign a class for styling
  //     .attr("d", line); // 11. Calls the line generator
  // }, []);

  return (
    <div>
      <StockDisplay price={dataPoint} />
    </div>
  )
}

StockContainer.propTypes = {
  endPoint: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
};

export default StockContainer;
