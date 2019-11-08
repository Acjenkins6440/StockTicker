import React from 'react';
import StockContainer from './StockContainer';
import apiConfig from '../../config';

const App = () => {
  const endPoint = `wss://ws.finnhub.io?token=${apiConfig.key}`;

  return (
    <div>
      <StockContainer endPoint={endPoint} symbol="BINANCE:BTCUSDT" />
    </div>
  );
};

export default App;
