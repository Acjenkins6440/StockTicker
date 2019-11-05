import React from 'react';
import PropTypes from 'prop-types';
import StockContainer from './StockContainer.js';

const App = ({ msg }) => (
  <div>
    <p id="test">{msg}</p>
    <StockContainer />
  </div>
);

App.propTypes = {
  msg: PropTypes.string.isRequired,
};

export default App;
