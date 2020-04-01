
class Event {
	constructor(type) {
		this.type = type
	}
}

const ClientEvent = Object.freeze({
	REGISTER: 'register',
	MESSAGE: 'message'
})

const ServerEvent = Object.freeze({
	PARTICIPANT_COUNT: 'participantCount'
})

module.exports = {
	Event,
	ClientEvent,
	ServerEvent
}
