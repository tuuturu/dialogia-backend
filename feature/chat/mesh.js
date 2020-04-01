
function broadcastToMesh(client, event) {
	client.websocket.send(JSON.stringify(event))

	client.partners.forEach(({ websocket }) => {
		websocket.send(JSON.stringify(event))
	})
}

module.exports = {
	broadcastToMesh
}
