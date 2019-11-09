import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import apiConfig from '../../config';
// import 'whatwg-fetch';


const margin = {
  top: 50, bottom: 50, left: 50, right: 50,
};
const width = 500;
const height = 400;
const dataThreshold = 15;
const webSocketEndPoint = `wss://ws.finnhub.io?token=${apiConfig.finnhubKey}`;

const StockContainer = ({ symbol }) => {
  const historicalDataEndPoint = `https://www.alphavantage.co/query?apikey=${apiConfig.alphavantageKey}&symbol=${symbol}&function=TIME_SERIES_DAILY`;

  const graphContainer = useRef(null);
  const [dataSet, updateDataSet] = useState([]);
  const [timeSelection, updateTimeSelection] = useState('90Days');
  const isLoading = dataSet.length > 0;
  const handleNewData = (newDataSet) => {
    console.log(newDataSet);
  }

  const minTime = () => ((dataSet[0]) ? dataSet[0].t : 0);
  const maxTime = () => ((dataSet[dataSet.length - 1]) ? dataSet[dataSet.length - 1].t : 0);
  const maxP = () => Math.max(...dataSet.map((dataPoint) => dataPoint.p));
  const minP = () => Math.min(...dataSet.map((dataPoint) => dataPoint.p));

  const timeFormat = d3.timeFormat(":%S");
  const maxXDomain = () => minTime() + (60 * 5);
  const minYDomain = () => minP() * 0.9999;
  const maxYDomain = () => maxP() * 1.0001;

  const xScale = d3
    .scaleTime()
    .domain([minTime(), maxXDomain()])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([minYDomain(), maxYDomain()])
    .range([height, 0]);


  useEffect( async () => {
    window.fetch(historicalDataEndPoint)
      .then(response => JSON.stringify(response))
      .then(response => {
        handleNewData(response)
      })
  },[]);
  // useEffect(() => {
  //   // adding websocket listeners and building graph
  //   const socket = new WebSocket(endPoint);
  //   socket.addEventListener('open', () => {
  //     socket.send(
  //       JSON.stringify({ type: 'subscribe', symbol }),
  //     );
  //   });
  //   socket.addEventListener('message', (event) => {
  //     const eventData = JSON.parse(event.data);
  //     const stockData = eventData.data[0];
  //     handleNewData(stockData);
  //   });
  // });
  useEffect(() => {
    if (graphContainer.current) {
      const svg = d3
        .select(graphContainer.current)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(timeFormat)) // Create an axis component with d3.axisBottom
      svg
        .append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
      svg.append('path').attr('class', 'line'); // Assign a class for styling
    }
  }, []);
  // useEffect(() => {
  //   const xScale = d3
  //     .scaleTime()
  //     .domain([minTime(), maxXDomain()])
  //     .range([0, width]);
  //
  //   const yScale = d3
  //     .scaleLinear()
  //     .domain([minYDomain(), maxYDomain()])
  //     .range([height, 0]);
  //
  //   const line = d3
  //     .line()
  //     .x((dataPoint) => xScale(dataPoint.t)) // set the x values for the line generator
  //     .y((dataPoint) => yScale(dataPoint.p)); // set the y values for the line generator
  //
  //   const update = d3.select(graphContainer.current);
  //
  //   update
  //     .select('.x-axis')
  //     .transition()
  //     .duration(200)
  //     .call(d3.axisBottom(xScale)
  //         .ticks(5)
  //         .tickFormat(timeFormat));
  //   update
  //     .select('.y-axis')
  //     .transition()
  //     .duration(200)
  //     .call(d3.axisLeft(yScale));
  //   update
  //     .select('.line')
  //     .datum(dataSet)
  //     .attr('d', line);
  // }, [dataSet]);
  return (
    <div>
    {
      isLoading === true ?
      <div className="loading">Loading...</div> :
      <svg
        className="d3-component"
        width={600}
        height={500}
        ref={graphContainer}
      />
    }
    </div>
  );
};

// StockContainer.propTypes = {
//   endPoint: PropTypes.string.isRequired,
//   symbol: PropTypes.string.isRequired,
// };

export default StockContainer;
