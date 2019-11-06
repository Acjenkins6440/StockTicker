import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import StockDisplay from './StockDisplay';

const StockContainer = ({ endPoint, symbol }) => {
  const [dataSet, updateDataSet] = useState([]);
  const [dataPoint, updateDataPoint] = useState(0);
  const handleNewData = (stockData) => {
    const price = stockData.p;
    if (price !== dataPoint) {
      updateDataPoint(price);
    }
    if (dataSet.length < 50) {
      updateDataSet([...dataSet, stockData]);
    } else {
      updateDataSet(dataSet.shift(1));
      updateDataSet([...dataSet, stockData]);
    }
  };

  useEffect(() => {
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
    });
  });
  return (
    <div>
      <StockDisplay price={dataPoint} />
    </div>
  );
};

StockContainer.propTypes = {
  endPoint: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
};

export default StockContainer;
