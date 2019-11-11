import React, {
  useEffect, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import apiConfig from '../../config';

const margin = {
  top: 50, bottom: 50, left: 50, right: 50,
};
const width = Math.max(document.documentElement.clientWidth * 0.7 || 600);
const height = Math.max(document.documentElement.clientHeight * 0.6 || 500);

const dailyFunction = 'TIME_SERIES_DAILY';
const intraDayFunction = 'TIME_SERIES_INTRADAY';
const dailySeries = 'Time Series (Daily)';
const minuteSeries = 'Time Series (1min)';
const open = '1. open';
const high = '2. high';
const low = '3. low';
const close = '4. close';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const webSocketEndPoint = `wss://ws.finnhub.io?token=${apiConfig.finnhubKey}`;

const minTime = (data) => ((data[data.length - 1]) ? data[data.length - 1].time : 0);
const maxTime = (data) => ((data[0]) ? data[0].time : 0);
const maxPrice = (data) => Math.max(...data.map((dataPoint) => dataPoint.high));
const minPrice = (data) => Math.min(...data.map((dataPoint) => dataPoint.low));

const formatYScale = (dollars) => `$${dollars}`;

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

const isGraphInitialized = () => document.getElementById('initializedGraph') !== null;

const StockContainer = ({ stockSymbol }) => {
  // Define constants
  const graphContainer = useRef(null);
  const [dataSets, updateDataSets] = useState({
    [dailySeries]: [],
    [minuteSeries]: [],
    tickerData: [],
  });
  const [timeSelection, updateTimeSelection] = useState('90Days');
  const [symbol, updateSymbol] = useState(stockSymbol);
  const alphavantageURL = `https://www.alphavantage.co/query?apikey=${apiConfig.alphavantageKey3}&symbol=${symbol}&function=`;
  const series = (timeSelection === 'tickerMode') ? minuteSeries : dailySeries;
  // Update symbol if necessary
  if (symbol !== stockSymbol) {
    updateSymbol(stockSymbol);
  }
  // Define constant functions
  const mouseoverFunc = (dataPoint) => {
    const dollarPrice = parseFloat(dataPoint.close);
    const timeStamp = (timeSelection === 'tickerMode')
      ? dataPoint.time.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$2$3')
      : `${months[dataPoint.time.getMonth()]} ${dataPoint.time.getDate()}`;

    d3.select('.tooltip')
      .style('opacity', 0.9)
      .html(`${timeStamp}<br/>$${dollarPrice}`)
      .style('left', `${d3.event.pageX}px`)
      .style('top', `${d3.event.pageY}px`);
  };

  const mouseoutFunc = () => {
    d3.select('.tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0);
  };

  const handleNewData = (newDataSet, tickerMode, updateDaily) => {
    // Tacking on single data points from the ticker
    const singleDataPoint = newDataSet.t !== undefined;
    if (singleDataPoint) {
      const timeStamp = new Date(newDataSet.t * 1000);
      const price = `${newDataSet.p}`;
      const massagedDataPoint = {
        time: timeStamp,
        close: price,
        open: price,
        high: price,
        low: price,
      };
      updateDataSets({
        ...dataSets,
        tickerData: [...dataSets.tickerData, massagedDataPoint],
      });
      return;
    }
    // Replacing dataSets
    const timeSeries = updateDaily
      ? newDataSet[dailySeries]
      : newDataSet[series];

    const timeList = (tickerMode)
      ? [...Object.keys(timeSeries)]
      : [...Object.keys(timeSeries).slice(0, 90)];

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
    if (updateDaily) {
      updateDataSets({
        [dailySeries]: massagedData,
        [series]: [],
        tickerData: [],
      });
    } else {
      updateDataSets({
        ...dataSets,
        [series]: massagedData,
      });
    }
  };

  const handleNewTickerData = (tickerData) => {
    const dataSet = dataSets[series];
    // Prevent the ticker data from updating more than once every second
    const timeStamp = new Date(tickerData.t * 1000);
    const previousTime = dataSet[dataSet.length - 1].time;
    const differenceInTime = timeStamp.getTime() - previousTime.getTime();
    const shouldUpdate = differenceInTime >= 1;
    if (shouldUpdate) {
      handleNewData(tickerData);
    }
  };
  const newTimeSelection = (e) => {
    const type = e.target.id;
    d3.selectAll('button')
      .attr('class', '');
    e.target.className = 'active-button';
    if (type === timeSelection) {
      return;
    }
    updateTimeSelection(type);
  };

  const initializeTickerMode = () => {
    const interval = '1min';
    const outputSize = 'compact';
    const endPoint = `${alphavantageURL}${intraDayFunction}&interval=${interval}&outpusize=${outputSize}`;
    const tickerMode = true;
    async function getIntraDayData() {
      const response = await fetch(endPoint);
      const data = await response.json();
      return data;
    }
    getIntraDayData()
      .then((response) => handleNewData(response, tickerMode));
  };

  const initializeTickerData = () => {
    const webSocket = new WebSocket(webSocketEndPoint);
    webSocket.addEventListener('open', () => {
      webSocket.send(
        JSON.stringify({ type: 'subscribe', symbol }),
      );
    });
    webSocket.addEventListener('message', (event) => {
      const eventData = JSON.parse(event.data);
      if (eventData.type === 'trade') {
        const stockData = eventData.data[0];
        handleNewTickerData(stockData);
      }
    });
  };

  const buildGraph = () => {
    const dataSet = dataSets[series];
    const xScale = getXScale(dataSet);
    const yScale = getYScale(dataSet);
    const line = getLine(xScale, yScale);

    const svg = d3
      .select(graphContainer.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('id', 'initializedGraph');
    d3.select('.tooltip-area')
      .append('span')
      .attr('class', 'tooltip')
      .style('opacity', 0);
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
      .call(d3.axisLeft(yScale)
        .tickFormat(formatYScale));
    svg
      .append('path')
      .attr('class', 'line')
      .datum(dataSet)
      .attr('d', line)
      .attr('clip-path', 'url(#rect-clip)');
    svg.selectAll('dot')
      .data(dataSet)
      .enter().append('circle')
      .attr('r', 5)
      .attr('cx', (dataPoint) => xScale(dataPoint.time))
      .attr('cy', (dataPoint) => yScale(dataPoint.close))
      .on('mouseover', mouseoverFunc)
      .on('mouseout', mouseoutFunc);
  };

  const updateGraph = () => {
    const dataSet = (timeSelection === 'tickerMode') ? dataSets[series].concat(dataSets.tickerData) : dataSets[series];
    const modifiedDataSet = (timeSelection === '30Days') ? dataSet.slice(0, 30) : dataSet;

    const xScale = getXScale(modifiedDataSet);
    const yScale = getYScale(modifiedDataSet);
    const line = getLine(xScale, yScale);

    const update = d3.select(graphContainer.current);
    const switchSets = (update.select('.line').datum()[0]) !== dataSet[0];

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
      .call(d3.axisLeft(yScale)
        .tickFormat(formatYScale));
    if (switchSets) {
      update
        .select('.line')
        .datum(dataSet)
        .transition()
        .attr('d', line);
    } else {
      update
        .select('.line')
        .transition()
        .attr('d', line);
    }
    update.selectAll('circle')
      .data([])
      .exit()
      .remove();
    update.selectAll('dot')
      .data(dataSet)
      .enter().append('circle')
      .transition()
      .attr('r', 5)
      .attr('cx', (dataPoint) => xScale(dataPoint.time))
      .attr('cy', (dataPoint) => yScale(dataPoint.close))
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('clip-path', 'url(#rect-clip)');
    update.selectAll('circle')
      .on('mouseover', mouseoverFunc)
      .on('mouseout', mouseoutFunc);
  };

  useEffect(() => {
    const alphavantageURL = `https://www.alphavantage.co/query?apikey=${apiConfig.alphavantageKey3}&symbol=${symbol}&function=`;
    const endPoint = alphavantageURL + dailyFunction;
    async function getStockData() {
      const response = await fetch(endPoint);
      const data = await response.json();
      return data;
    }
    if (timeSelection === 'tickerMode') {
      const updateDaily = true;
      getStockData()
        .then((response) => handleNewData(response, null, updateDaily));
    } else {
      getStockData()
        .then((response) => handleNewData(response));
    }
  }, [symbol]);

  useEffect(() => {
    const dataSet = dataSets[series];
    if (timeSelection === 'tickerMode') {
      if (dataSet.length === 0) { initializeTickerMode(); } else if (dataSet.length === 100) { initializeTickerData(); }
    }
    if (graphContainer.current && dataSet.length > 0 && !isGraphInitialized()) {
      buildGraph();
    } else if (graphContainer.current && dataSet.length > 0) {
      updateGraph();
    }
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
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
        ref={graphContainer}
      />
      <div className="button-area">
        <button onClick={newTimeSelection} id="90Days" type="button" className="active-button">90 Business Days</button>
        <button onClick={newTimeSelection} id="30Days" type="button">30 Business Days</button>
        <button onClick={newTimeSelection} id="tickerMode" type="button">Ticker Mode</button>
      </div>
    </div>
  );
};

StockContainer.propTypes = {
  stockSymbol: PropTypes.string.isRequired,
};
export default StockContainer;
