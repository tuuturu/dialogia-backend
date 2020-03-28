const WebSocket = require('ws');
const chatServer = require('./chat')


function start() {
	const wss = new WebSocket.Server({ port: 8081 });

	wss.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log("- Received message", message);

			const clientEvent = JSON.parse(message)

			chatServer.handleClientEvent(clientEvent)
		});

		chatServer.sendMessage(ws, "Hello from server 1")
		chatServer.sendMessage(ws, "Hello from server 2")
	});
}

module.exports = {
	start
}
