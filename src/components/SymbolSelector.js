import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import apiConfig from '../../config';
import StockContainer from './StockContainer.js';

const SymbolSelector = () => {
  const [symbol, updateSymbol] = useState('NFLX');
  const handleSymbolChange = (e) => {
    const newSymbol = e.target.value;
    updateSymbol(newSymbol);
  };
  return (
    <div>
      <form onChange={handleSymbolChange}>
        <select name="stocks">
          <option value="NFLX">NETFLIX</option>
          <option value="GE">General Electric</option>
          <option value="UBER">Uber</option>
        </select>
      </form>
      <StockContainer symbol={symbol} />
    </div>
  );
};

export default SymbolSelector;
