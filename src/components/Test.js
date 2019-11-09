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
const webSocketEndPoint = `wss://ws.finnhub.io?token=${apiConfig.finnhubKey}`;
const dailyFunction = "TIME_SERIES_DAILY";
const intraDayFunction = "TIME_SERIES_INTRADAY";
const desiredProp = 'Time Series (Daily)';
const open = '1. open';
const high = '2. high';
const low = '3. low';
const close = '4. close';

const minTime = (data) => ((data[data.length - 1]) ? data[data.length - 1].time : 0);
const maxTime = (data) => ((data[0]) ? data[0].time : 0);
const maxPrice = (data) => Math.max(...data.map((dataPoint) => dataPoint.high));
const minPrice = (data) => Math.min(...data.map((dataPoint) => dataPoint.low));

const getXScale = (data) => d3
  .scaleTime()
  .domain([minTime(data), maxTime(data)])
  .range([0, width]);

const getYScale = (data) => d3
  .scaleLinear()
  .domain([minPrice(data), maxPrice(data)])
  .range([height, 0]);

const getLine = (xScale, yScale) => d3
  .line()
  .x((dataPoint) => xScale(dataPoint.time))
  .y((dataPoint) => yScale(dataPoint.close));

const StockContainer = ({ symbol }) => {
  const alphavantageEndPoint = `https://www.alphavantage.co/query?apikey=${apiConfig.alphavantageKey}&symbol=${symbol}&function=`;
  const graphContainer = useRef(null);
  const [dataSet, updateDataSet] = useState([]);
  const [timeSelection, updateTimeSelection] = useState('90Days');
  const [tickerData, updateTickerData] = useState([]);
  const handleNewHistoricalData = (newDataSet) => {
    const timeSeries = newDataSet[desiredProp];
    const timeList = [...Object.keys(timeSeries).slice(0, 90)];
    const massagedData = timeList.map((timeStamp) => {
      const dataPoint = timeSeries[timeStamp];
      return {
        time: new Date(timeStamp),
        open: dataPoint[open],
        close: dataPoint[close],
        high: dataPoint[high],
        low: dataPoint[low],
      };
    });
    updateDataSet(massagedData);
  };
  const handleNewTickerData = (newDataSet) => {

  }
  const newTimeSelection = (e) => {
    const type = e.target.className;
    if (type === timeSelection) {
      return;
    }
    if ((type === '90Days' || type === '30Days')) {
      updateTimeSelection(type);
    } else if (type == 'tickerMode') {
      initializeTickerMode();
    }
  };
  const initializeTickerMode = () => {
    const interval = "1min";
    const outputSize = "compact";
    const endPoint = alphavantageEndPoint + `${intraDayFunction}&interval=${interval}&outpusize=${outputSize}`
    async function getIntraDayData() {
      const response = await fetch(endPoint);
      const data = await response.json();
      return data;
    }
    getIntraDayData()
      .then((response) => handleNewTickerData(response))
  };



  useEffect(() => {
    const endPoint = alphavantageEndPoint + dailyFunction;
    async function getStockData() {
      const response = await fetch(endPoint);
      const data = await response.json();
      return data;
    }
    getStockData()
      .then((response) => handleNewHistoricalData(response));
  }, []);
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
  //     handleNewHistoricalData(stockData);
  //   });
  // });
  useEffect(() => {
    if (graphContainer.current && dataSet.length > 0) {
      const xScale = getXScale(dataSet);
      const yScale = getYScale(dataSet);
      const line = getLine(xScale, yScale);

      const svg = d3
        .select(graphContainer.current)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      svg
        .append('defs')
        .append('svg:clipPath')
        .attr('id', 'rect-clip')
        .append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);
      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .ticks(4));
      svg
        .append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale));
      svg
        .append('path')
        .attr('class', 'line')
        .datum(dataSet)
        .attr('d', line)
        .attr('clip-path', 'url(#rect-clip)');
    }
  }, [dataSet]);

  useEffect(() => {
    if (dataSet.length > 0) {
      const modifiedDataSet = (timeSelection === '30Days') ? dataSet.slice(0, 30) : dataSet;

      const xScale = getXScale(modifiedDataSet);
      const yScale = getYScale(modifiedDataSet);
      const line = getLine(xScale, yScale);

      const update = d3.select(graphContainer.current);
      update
        .select('.x-axis')
        .transition()
        .duration(400)
        .call(d3.axisBottom(xScale)
          .ticks(6));
      update
        .select('.y-axis')
        .transition()
        .duration(400)
        .call(d3.axisLeft(yScale));
      update
        .select('.line')
        .transition()
        .attr('d', line);
    }
  }, [timeSelection]);
  useEffect(() => {
    if(tickerData.length > 0){

    }
  }, [tickerData])
  return (
    <div>
      {
      dataSet.length === 0
        ? <div className="loading">Loading...</div>
        : <div />
    }
      <svg
        className="d3-component"
        width={600}
        height={500}
        ref={graphContainer}
      />
      <button onClick={newTimeSelection} className="90Days">90 Business Days</button>
      <button onClick={newTimeSelection} className="30Days">30 Business Days</button>
      <button onClick={newTimeSelection} className="tickerMode">Ticker Mode</button>
    </div>
  );
};


export default StockContainer;
