import React, { useState } from 'react';
import StockContainer from './StockContainer';


const SymbolSelector = () => {
  const [symbol, updateSymbol] = useState('NFLX');
  const handleSymbolChange = (e) => {
    const newSymbol = e.target.value;
    updateSymbol(newSymbol);
  };
  return (
    <div className="graph-area">
      <form onChange={handleSymbolChange} className="symbol-selector">
        <select name="stocks" className="dropdown">
          <option value="NFLX">NETFLIX</option>
          <option value="GE">General Electric</option>
          <option value="UBER">Uber</option>
        </select>
      </form>
      <StockContainer stockSymbol={symbol} />
    </div>
  );
};

export default SymbolSelector;
