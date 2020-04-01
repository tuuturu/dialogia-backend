const express = require('express')
const router = express.Router()
const websocketServer = require('./server')

router.get('/', async (req, res) => {
	res.json()
})

websocketServer.start()

module.exports = router
