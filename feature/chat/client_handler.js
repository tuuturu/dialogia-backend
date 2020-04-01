const { nanoid } = require('nanoid')
const { broadcastToMesh } = require('./mesh')
const { Event, ClientEvent, ServerEvent } = require('./events')
const { bumpSubject } = require('../common/subject_repository')

const subjectQueue = {}
const clientMap = {}

class Client {
	constructor(guid, websocket, subject) {
		this.guid = guid
		this.websocket = websocket
		this.subject = subject || 'anything'
		this.partners = []
	}
}

function connect(clientA, clientB) {
	clientA.partners.push(clientB)
	clientB.partners.push(clientA)

	const event = new Event(ServerEvent.PARTICIPANT_COUNT)
	event.count = clientA.partners.length + clientB.partners.length

	broadcastToMesh(clientA, event)
}
function disconnect(clientA, clientB) {
  clientA.partners.splice(clientA.indexOf(clientB), 1)
  clientB.partners.splice(clientB.indexOf(clientA), 1)

  const event = new Event(ServerEvent.PARTICIPANT_COUNT)
  event.count = clientB.partners.length

  broadcastToMesh(clientB, event)
}

function connectOrQueueClient(client) {
	const subject = client.subject

	if (!subjectQueue[subject]) subjectQueue[subject] = []

	const partner = subjectQueue[subject].pop()

	if (partner)
    connect(client, partner)
	else
    subjectQueue[subject].push(client)
}

function registerClient(socket, event) {
	const client = new Client(nanoid(), socket, event.subject)

	clientMap[socket] = client

	bumpSubject(client.subject)
	connectOrQueueClient(client)
}

function unregisterClient(ws) {
  const client = clientMap[ws]

  disconnect(client, client.partner[0])

  delete clientMap[ws]
}

function clientHandler(socket, event) {
	switch (event.type) {
		case ClientEvent.REGISTER:
			registerClient(socket, event)
			break
		case ClientEvent.MESSAGE:
      broadcastToMesh(clientMap[socket], event)
			break
		default:
			console.error(`No handler made for ${event.type}`)
	}
}

module.exports = {
	Client,
	clientHandler,
  unregisterClient
}
