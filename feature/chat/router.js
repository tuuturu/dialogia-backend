const express = require('express')
const WebSocket = require('ws');

const router = express.Router()

router.get('/', async (req, res) => {
	res.json()
})

module.exports = router

// CHAT
const clients = {}

function sendMessage(ws, msg) {
	const serverEvent = {
		sender: "server",
		message: msg
	}
	ws.send(JSON.stringify(serverEvent));
}

function handleClientEvent(clientEvent) {
}

console.log("Starting chat websocket server");

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log("- Received message", message);

		const clientEvent = JSON.parse(message)

		handleClientEvent(clientEvent)
	});

	sendMessage(ws, "Hello from server 1")
	sendMessage(ws, "Hello from server 2")
});
