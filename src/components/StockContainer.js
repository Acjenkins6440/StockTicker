import apiConfig from '../../config.js';

const endPoint = 'wss://ws.finnhub.io?token=' + apiConfig.key;
const socket = new WebSocket(endPoint);

socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'AAPL'}))
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:BTCUSDT'}))
    socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'IC MARKETS:1'}))
});

socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});

var unsubscribe = function(symbol) {
   socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
};

const StockContainer = () => (
  <div>
  </div>
)

export default StockContainer;
