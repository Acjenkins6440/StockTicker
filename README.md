# Stock Ticker

This app shows 90 and 30 day historical stock data for three selectable stocks.  

### Tracking a new stock

In order to start tracking a new stock, just pick one from the dropdown at the top of the graph.

### Entering Ticker Mode

Ticker mode fetches the last few hours of trade data, and then starts appending real-time trades to the end of the graph.  __*Ticker Mode only available during open stock market hours (9:30am - 4pm EST)*__

### How To Open

1) `git clone` to copy master repository 
2) `npm install` to install dependencies
3) `npm start` to host build locally 
4) navigate to `localhost:8080` in a web browser

### Notes

The Alphavantage key used is free-tier and only allows 5 requests per minute.  Opening the app once is one request, switching symbols or switching to ticker mode is a request, and switching symbols WHILE IN ticker mode is two requests. If the app seems to freeze, simply wait a minute and refresh.  

### TODO

Replace stock dropdown with fuzzyfinder using alphavantage's search endpoint
