const WebSocket = require('ws');
const { nanoid } = require('nanoid')

// COMMON FOR FEATURES BELOW
function sendServerEvent(ws, serverEvent) {
	console.log("Sending from server", serverEvent)
	ws.send(JSON.stringify(serverEvent));
}

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

	webSocketServer.on('close', function connection(ws) {
		console.log("CLOSE");
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
// COMMON FOR FEATURES BELOW
const clients = []
const subjectToClient = {}

class Client {
	constructor(guid, websocket, subject, name) {
		this.guid = guid
		this.websocket = websocket
		this.subject = subject
		this.name = name
	}
}

// --- FEATURE: Register client
function handleClientEventRegister(websocket, clientEvent) {
	const newClient = registerClient(websocket, clientEvent)
	sendParticipantCount(newClient)
}

function registerClient(websocket, clientEvent) {
	const newClient = new Client(nanoid(), websocket, clientEvent.subject, clientEvent.clientName)
	clients.push(newClient)
	subjectToClient[newClient.subject] = newClient

	return newClient
}

function sendParticipantCount(newClient) {
	sendServerEvent(newClient.websocket, {
		type: "participantCount",
		count: getParticipantCountForSubject(newClient)
	})
}

function getParticipantCountForSubject(newClient) {
	console.log("getParticipantCountForSubject")
	const reducer = (count, client) => {
		if (client.subject === newClient.subject)
			return count + 1
		else
			return count
	}

	return clients.reduce(reducer, 0)
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
	const sourceClient = getClientByWebsocket(sourceClientWebsocket)

	clients.forEach((targetClient) => {
		console.log("Considering", targetClient.name)

		if (sourceClient !== targetClient && sourceClient.subject === targetClient.subject) {
			console.log("broadcasting to ", targetClient.name)
			sendServerEvent(targetClient.websocket, createServerMessageType(sourceClient.name, clientEvent.message))
		}
	})
}

// TODO: Implement as O(1) search instead of O(n)
function getClientByWebsocket(websocket) {
	return clients.filter(client => client.websocket === websocket)[0]
}

// --- OTHER
module.exports = {
	start
}
