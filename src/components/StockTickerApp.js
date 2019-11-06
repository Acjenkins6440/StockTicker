import React from 'react';
import PropTypes from 'prop-types';
import StockContainer from './StockContainer';
import apiConfig from '../../config';

const App = ({ msg }) => {
  const endPoint = `wss://ws.finnhub.io?token=${apiConfig.key}`;

  return (
    <div>
      <p id="test">{msg}</p>
      <StockContainer endPoint={endPoint} symbol="BINANCE:BTCUSDT" />
    </div>
  );
};

App.propTypes = {
  msg: PropTypes.string.isRequired,
};

export default App;
