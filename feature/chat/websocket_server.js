const WebSocket = require('ws');
const { nanoid } = require('nanoid')

// COMMON FOR FEATURES BELOW
function sendServerEvent(client, serverEvent) {
	console.log("Sending from server", serverEvent)
	client.websocket.send(JSON.stringify(serverEvent));
}

const clients = []
const subjectToClient = {}

// --- FEATURE: Web socket server
function start() {
	const webSocketServer = new WebSocket.Server({ port: 8081 });

	webSocketServer.on('connection', function connection(ws) {
		ws.on('message', function incoming(message) {
			console.log("- Received message", message);

			const clientEvent = JSON.parse(message)

			handleClientEvent(ws, clientEvent)
		});

		ws.on('close', function handle() {
			console.log("CLOSE")
			disconnectClient(ws)
		})
	});
}

function disconnectClient(ws) {
	const disconnectedClient = getClientByWebsocket(ws)

	const index = clients.indexOf(disconnectedClient);
	if (index > -1) {
		clients.splice(index, 1);
	}

	const subjectIndex = subjectToClient[disconnectedClient.subject].indexOf(disconnectedClient)
	if (subjectIndex > -1) {
		subjectToClient[disconnectedClient.subject].splice(subjectIndex, 1);
	}

	if (subjectToClient[disconnectedClient.subject].length == 0)
		delete subjectToClient[disconnectedClient.subject]

	broadcastParticipantCountForSubject(disconnectedClient.subject)
}

function handleClientEvent(websocket, clientEvent) {
	if (clientEvent.type === "register")
		handleClientEventRegister(websocket, clientEvent)
	else if (clientEvent.type === "message")
		broadcastClientMessage(websocket, clientEvent)
	else
		console.error("No handler for type: " + clientEvent.type)
}
// COMMON FOR FEATURES BELOW

class Client {
	constructor(guid, websocket, subject) {
		this.guid = guid
		this.websocket = websocket
		this.subject = subject
	}
}

function broadcastToAllClients(subject, data) {
	if (!subjectToClient.hasOwnProperty(subject))
		return

	subjectToClient[subject].forEach(targetClient => {
		sendServerEvent(targetClient, data)
	})
}

function broadcastToOtherClients(sourceClient, data) {
	if (!subjectToClient.hasOwnProperty(sourceClient.subject))
		return

	subjectToClient[sourceClient.subject].forEach(targetClient => {
		if (targetClient !== sourceClient) {
			sendServerEvent(targetClient, data)
		}
	})
}

// --- FEATURE: Register client
function handleClientEventRegister(websocket, clientEvent) {
	const newClient = new Client(nanoid(), websocket, clientEvent.subject)
	//console.log("newClient: " + newClient.guid + ", " + newClient.subject)

	registerClient(newClient)
	broadcastParticipantCountForSubject(newClient.subject)
}

function registerClient(newClient) {
	//console.log("registerClient", newClient.subject)
	clients.push(newClient)

	if (!subjectToClient.hasOwnProperty(newClient.subject)) {
		subjectToClient[newClient.subject] = []
	}

	subjectToClient[newClient.subject].push(newClient)
}

function broadcastParticipantCountForSubject(subject) {
	const participantCount = getParticipantCountForSubject(subject)
	// console.log("broadcastParticipantCountForSubject", participantCount)

	broadcastToAllClients(subject, {
		type: "participantCount",
		count: participantCount
	})
}

function getParticipantCountForSubject(subject) {
	// console.log("getParticipantCountForSubject", subject)
	if (!subjectToClient.hasOwnProperty(subject)) {
		return 0
	}

	return subjectToClient[subject].length
}

// --- FEATURE: Broadcast
function createServerMessageType(from, message) {
	return {
		type: "message",
		from: from,
		message: message
	}
}

function broadcastClientMessage(sourceClientWebsocket, clientEvent) {
	const sourceClient = getClientByWebsocket(sourceClientWebsocket)
	broadcastToOtherClients(sourceClient, createServerMessageType(sourceClient.name, clientEvent.message))
}

// TODO: Implement as O(1) search instead of O(n)
function getClientByWebsocket(websocket) {
	const matches = clients.filter(client => client.websocket === websocket)

	if (matches.length === 0) {
	 	console.error("Could not find client by websocket!")
	}

	return matches[0]
}

// --- OTHER
module.exports = {
	start
}
