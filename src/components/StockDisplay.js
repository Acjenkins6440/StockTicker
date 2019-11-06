import React from 'react';
import PropTypes from 'prop-types';

const StockDisplay = ({ price }) => (
  <span>
Price is:
    {price}
  </span>
);

StockDisplay.propTypes = {
  price: PropTypes.number.isRequired,
};

export default StockDisplay;
