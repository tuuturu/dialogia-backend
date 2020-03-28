const axios = require('axios')

function isActive() {
	return !!process.env.SLACK_CHANNELS_TOKEN
}

async function getPublicChannels(query = '') {
	const token = process.env.SLACK_CHANNELS_TOKEN

	const { data } = await axios.request({
		url: 'https://slack.com/api/channels.list',
		method: 'get',
		headers: {
			Authorization: `Bearer ${token}`
		},
		params: {
			exclude_members: true
		}
	})

	return data.channels
		.filter(channel => !channel.is_archived)
		.filter(channel => channel.name.toLowerCase().includes(query.toLowerCase()))
		.map(channel => ({
			id: channel.id,
			name: channel.name
		}))
}

module.exports = {
	getPublicChannels,
	isActive
}
