const { IncomingWebhook } = require('@slack/webhook')

function isEnabled() {
	if (!process.env.SLACK_WEBHOOK_URL) return false

	return true
}

const sendFeedback = async message => {
	const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL, {
		icon_emoji: ':smile_cat:',
		username: 'FeedbackBot',
	})

	await webhook.send({ text: message })
}

module.exports = {
	isEnabled,
	sendFeedback
}
