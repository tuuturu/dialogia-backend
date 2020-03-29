const WebSocket = require('ws');
const { nanoid } = require('nanoid')

// --- FEATURE: Web socket server
function start() {
	const webSocketServer = new WebSocket.Server({ port: 8081 });

	webSocketServer.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log("- Received message", message);

			const clientEvent = JSON.parse(message)

			handleClientEvent(ws, clientEvent)
		});
	});
}

function handleClientEvent(websocket, clientEvent) {
	if (clientEvent.type === "register")
		handleClientEventRegister(websocket, clientEvent)
	else if (clientEvent.type === "message")
		broadcast(websocket, clientEvent)
	else
		console.error("No handler for type: " + clientEvent.type)
}

function handleClientEventRegister(websocket, clientEvent) {
	registerClient(websocket, clientEvent)
	sendServerEvent(websocket, )
}

// COMMON FOR FEATURES BELOW
const clients = []

class Client {
	constructor(guid, name, websocket) {
		this.guid = guid
		this.name = name
		this.websocket = websocket
	}
}

function sendServerEvent(ws, serverEvent) {
	console.log("Sending from server", serverEvent)
	ws.send(JSON.stringify(serverEvent));
}

// --- FEATURE: Register client
function registerClient(websocket, clientEvent) {
	clients.push(new Client(nanoid(), clientEvent.clientName, websocket))
}

// --- FEATURE: Broadcast
function createServerMessageType(from, message) {
	return {
		type: "message",
		from: from,
		message: message
	}
}


function broadcast(sourceClientWebsocket, clientEvent) {
	clients.forEach((client) => {
		console.log("Considering", client.name)

		if (sourceClientWebsocket != client.websocket) {
			console.log("broadcasting to ", client.name)
			const sourceClient = getClientByWebsocket(sourceClientWebsocket)
			console.log("sourceClient", sourceClient)
			sendServerEvent(client.websocket, createServerMessageType(sourceClient.name, clientEvent.message))
		} else {
			console.log("NOT broadcasting to ", client.name)
		}
	})
}

// TODO: Innefective O(n^2) implementation when used from a for loop
function getClientByWebsocket(websocket) {
	return clients.filter(client => client.websocket === websocket)[0]
}

// --- OTHER
module.exports = {
	start
}
