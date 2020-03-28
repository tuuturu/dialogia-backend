const express = require('express')
const router = express.Router()
const websocketServer = require('./websocket_server')

router.get('/', async (req, res) => {
	res.json()
})

websocketServer.start()

module.exports = router
