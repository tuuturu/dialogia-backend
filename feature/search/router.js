const express = require('express')

const emailSender = require('./emailSender')
const slackSender = require('./slackSender')

const router = express.Router()

router.post('/', async (req, res) => {
	const body = req.body;
	if (!body || !body.text) {
		res.status(400).send('text attribute required!');
	} else if (body.text.length < 5 || body.text.length > 500) {
		res.status(400).send('text attribute needs to be between 5 and 500 characters!');
	} else {
		let status = 200
		const errors = []

		if (slackSender.isEnabled()) {
			try {
				await slackSender.sendFeedback(body.text)
			}
			catch (error) {
				status = 500
				errors.push(error)
			}
		}

		if (emailSender.isEnabled()) {
			try {
				await emailSender.sendFeedback(body.text)
			}
			catch (error) {
				status = 500
				errors.push(error)
			}
		}

		res.status(status).json({ errors })
	}
})

module.exports = router
