var express = require('express');
var app = express();
var fs = require('fs');
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};
var server = require('https').Server(options, app);
var WebSocketServer = require('ws').Server;
var handleWebSocket = require('./handleWebSocket/webSocket.js').handleWebSocket;
/*wss = new WebSocketServer({
    server: server
});*/
wss = new WebSocketServer({
    port: 3000
});
/*var PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server running at port '+ PORT+ ' !');
});*/
app.use('/', express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/', express.static(__dirname + '/node_modules/webrtc-adapter'));
app.use('/', express.static(__dirname + '/node_modules/detectrtc'));
app.use('/', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

handleWebSocket(wss);
