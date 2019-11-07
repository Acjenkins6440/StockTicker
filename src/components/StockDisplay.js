import React from 'react';
import PropTypes from 'prop-types';

const StockDisplay = ({ price }) => (
  <svg
  name="stock-graph"
  width={600}
  height={500}
  />
);

StockDisplay.propTypes = {
  price: PropTypes.number.isRequired,
};

export default StockDisplay;
