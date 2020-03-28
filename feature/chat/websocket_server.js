const WebSocket = require('ws');
const { nanoid } = require('nanoid')

console.log("_------------------------------- INITING CLIENTS")
const clients = {}

class Client {
	constructor(guid, name, websocket) {
		this.guid = guid
		this.name = name
		this.websocket = websocket
	}
}

function start() {
	const webSocketServer = new WebSocket.Server({ port: 8081 });

	webSocketServer.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log("- Received message", message);

			const clientEvent = JSON.parse(message)

			handleClientEvent(webSocketServer, ws, clientEvent)
		});
	});
}

function createServerEvent(from, message) {
	return {
		from: from,
		message: message
	}
}

function sendServerEvent(ws, serverEvent) {

	console.log("Sending from server", serverEvent)
	ws.send(JSON.stringify(serverEvent));
}

function handleClientEvent(webSocketServer, websocket, clientEvent) {
	if (clientEvent.type === "register")
		registerClient(websocket, clientEvent);
	else if (clientEvent.type === "message")
		broadcast(webSocketServer, websocket, clientEvent)
	else
		console.warn("No handler for type: " + clientEvent.type)
}

function registerClient(websocket, clientEvent) {
	console.log("Registering client", clientEvent.clientName)
	console.log("* Old number of clients: ", Object.keys(clients).length)
	//console.log(websocket)
	clients[websocket] = new Client(nanoid(), clientEvent.clientName, websocket)
	console.log("* New number of clients: ", Object.keys(clients).length)
}

function broadcast(webSocketServer, sourceClientWebsocket, clientEvent) {
	webSocketServer.clients.forEach(function(client) {
		if (client !== sourceClientWebsocket && client.readyState === WebSocket.OPEN) {
			sendServerEvent(client, createServerEvent("SOMEBODY", clientEvent.message))
		} else {
			console.log("Skipping someone")
		}

		/*
				console.log("Considering", client.name)

				const client = clients[websocket]

		if (websocket != client.websocket) {
			console.log("broadcasting to ", client.name)
		} else {
			console.log("NOT broadcasting to ", client.name)
		}
		 */
	});
}

module.exports = {
	start
}
