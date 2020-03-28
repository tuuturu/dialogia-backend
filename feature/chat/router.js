const express = require('express')

const { getPublicChannels, isActive } = require('./slack_api')

const router = express.Router()

router.get('/', async (req, res) => {
	if (!isActive()) return res.status(501).end()

	const type = req.query.type
	const query = req.query.query ? req.query.query : ''

	if (!type) return res.status(400).end()

	let channels = []

	try {
		if (type === 'public') channels = await getPublicChannels(query)
	}
	catch (error) {
		console.error(error)

		if (error.response) return res.status(error.response.status).end()
		else return res.status(500).end()
	}

	res.json({ channels })
})

module.exports = router
