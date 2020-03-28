const express = require('express')
const WebSocket = require('ws');

const router = express.Router()

router.get('/', async (req, res) => {
	res.json()
})

module.exports = router


// CHAT
console.log("Starting chat websocket server");

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

	ws.send('something');
});
