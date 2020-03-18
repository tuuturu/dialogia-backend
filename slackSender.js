const { IncomingWebhook } = require('@slack/webhook')

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL, {
	icon_emoji: ':smile_cat:',
	username: 'FeedbackBot',
})

const sendFeedback = (message, callback) => {
	webhook.send({ text: message })
		.then(callback(undefined))
		.catch(callback)
}

module.exports = sendFeedback
