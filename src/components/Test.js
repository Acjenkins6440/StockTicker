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
const dailySeries = 'Time Series (Daily)';
const minuteSeries = 'Time Series (1min)'
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

const isGraphInitialized = () =>
  document.getElementById("initializedGraph") !== null;


const StockContainer = ({ symbol }) => {
  // const getReadyState = () => {
  //   console.log(socket.readyState);
  //   console.log(WebSocket.OPEN);
  // }

  const alphavantageEndPoint = `https://www.alphavantage.co/query?apikey=${apiConfig.alphavantageKey}&symbol=${symbol}&function=`;
  const graphContainer = useRef(null);
  const [dataSets, updateDataSets] = useState({
    [dailySeries]: [],
    [minuteSeries]: [],
    'tickerData': []
  });
  const [timeSelection, updateTimeSelection] = useState('90Days');
  const series = (timeSelection === "tickerMode") ? minuteSeries : dailySeries;
  const handleNewData = (newDataSet, tickerMode) => {

    const singleDataPoint = (newDataSet.t === undefined) ? false : true;
    if(singleDataPoint){
      const timeStamp = new Date(newDataSet.t * 1000);
      const price = `${newDataSet.p}`
      const massagedDataPoint = {
        time: timeStamp,
        close: price,
        open: price,
        high: price,
        low: price
      }
      console.log(dataSets['tickerData'])
      updateDataSets({
        ...dataSets,
        'tickerData': [...dataSets['tickerData'], massagedDataPoint]
      });
      return;
    }
    else if(singleDataPoint){
      return
    }

    const dataSet = dataSets[series];
    const timeSeries = newDataSet[series];
    const timeList = (tickerMode) ?
    [...Object.keys(timeSeries)] :
    [...Object.keys(timeSeries).slice(0, 90)]

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
    updateDataSets({
      ...dataSets,
      [series]: massagedData
    });

  }

  const handleNewTickerData = (tickerData) => {
    const dataSet = dataSets[series];
    const timeStamp = new Date(tickerData.t * 1000);
    const previousTime = dataSet[dataSet.length - 1].time;
    const differenceInTime = timeStamp.getTime() - previousTime.getTime();
    const shouldUpdate = differenceInTime >= 1;
    console.log(differenceInTime / 1000);
    if(shouldUpdate){
      handleNewData(tickerData);
    }
  }
  const newTimeSelection = (e) => {
    const type = e.target.className;
    if (type === timeSelection) {
      return;
    }
    updateTimeSelection(type);
  };

  const initializeTickerMode = () => {
    const interval = "1min";
    const outputSize = "compact";
    const endPoint = alphavantageEndPoint + `${intraDayFunction}&interval=${interval}&outpusize=${outputSize}`;
    const tickerMode = true;
    async function getIntraDayData() {
      const response = await fetch(endPoint);
      const data = await response.json();
      return data;
    }
    getIntraDayData()
      .then((response) => handleNewData(response, tickerMode))
  }

  const initializeTickerData = () => {
    const socket = new WebSocket(webSocketEndPoint);
    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({ 'type': 'subscribe', symbol }),
      );
    });
    socket.addEventListener('message', (event) => {
      const eventData = JSON.parse(event.data);
      if(eventData.type === "trade"){
        const stockData = eventData.data[0];
        handleNewTickerData(stockData);
      }
    });
    setTimeout(() => {
      socket.send(JSON.stringify({'type':'unsubscribe', symbol}))
    }, 10000)
  }

  const buildGraph = () =>  {
    const dataSet = dataSets[series];
    const xScale = getXScale(dataSet);
    const yScale = getYScale(dataSet);
    const line = getLine(xScale, yScale);

    const svg = d3
      .select(graphContainer.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('id', 'initializedGraph');
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

  const updateGraph = () => {
    const dataSet = (timeSelection === "tickerMode") ? dataSets[series].concat(dataSets['tickerData']) : dataSets[series];
    console.log(dataSet.length)
    const modifieddataSet = (timeSelection === '30Days') ? dataSet.slice(0, 30) : dataSet;

    const xScale = getXScale(modifieddataSet);
    const yScale = getYScale(modifieddataSet);
    const line = getLine(xScale, yScale);

    const update = d3.select(graphContainer.current);
    const switchSets = (update.select(".line").datum().length) !== dataSet.length;

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
    if(switchSets){
      update
        .select('.line')
        .datum(dataSet)
        .transition()
        .attr('d', line);
    }
    else{
      update
        .select('.line')
        .transition()
        .attr('d', line);
    }
  }

  useEffect(() => {
    const endPoint = alphavantageEndPoint + dailyFunction;
    async function getStockData() {
      const response = await fetch(endPoint);
      const data = await response.json();
      return data;
    }
    getStockData()
      .then((response) => handleNewData(response));
  }, []);

  useEffect(() => {
    const dataSet = dataSets[series];
    if(timeSelection === "tickerMode" && dataSet.length === 0 ){
      initializeTickerMode();
    }
    else if(timeSelection === "tickerMode" && dataSet.length === 100){
      initializeTickerData();
    }
    if(graphContainer.current && dataSet.length > 0 && !isGraphInitialized()){
      buildGraph();
    }
    else if(graphContainer.current && dataSet.length > 0){
      updateGraph()
    }
    // if(timeSelection !== "tickerMode" && socket.readyState === WebSocket.OPEN){
    //   console.log("closing")
    //   socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}));
    // }
  }, [timeSelection, dataSets]);
  return (
    <div>
      {
      dataSets[dailySeries].length === 0
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
