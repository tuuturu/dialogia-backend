function sendMessage(ws, msg) {
	const serverEvent = {
		sender: "server",
		message: msg
	}
	ws.send(JSON.stringify(serverEvent));
}

function handleClientEvent(clientEvent) {

}

const clients = {}

console.log("Starting chat websocket server");

module.exports = {
	sendMessage,
	handleClientEvent
}
