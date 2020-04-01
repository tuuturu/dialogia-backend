const WebSocket = require('ws');
const { nanoid } = require('nanoid')

const { clientHandler, unregisterClient } = require('./client_handler')
const { bumpSubject } = require('../common/subject_repository')

// --- FEATURE: Web socket server
function start() {
	const webSocketServer = new WebSocket.Server({ port: 8081 });

	webSocketServer.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log("- Received message", message);

			const clientEvent = JSON.parse(message)

			clientHandler(ws, clientEvent)
		});

		ws.on('close', function handle() {
			console.log("CLOSE")
			unregisterClient(ws)
		})
	});
}

// --- OTHER
module.exports = {
	start
}
