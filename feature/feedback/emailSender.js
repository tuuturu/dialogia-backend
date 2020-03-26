const axios = require('axios');

function isEnabled() {
    if (!process.env.EMAIL_API_ENDPOINT_URL) return false
    if (!process.env.EMAIL_API_API_KEY) return false
	  if (!process.env.RECIPIENT_EMAIL_ADDRESS) return false

    return true
}

async function sendFeedback(message) {
	  let apiKey = process.env.EMAIL_API_API_KEY
    apiKey = apiKey.split('\n').join('')

    const requestBody = {
        mottakerepost: [process.env.RECIPIENT_EMAIL_ADDRESS],
        avsenderepost: process.env.RECIPIENT_EMAIL_ADDRESS,
        emne: 'New feedback from developer portal',
        meldingskropp: message
    }

    await axios.request({
        url: process.env.EMAIL_API_ENDPOINT_URL,
        method: 'post',
        headers: {
            "content-type": "application/json",
            "apikey": apiKey
        },
        data: requestBody
    })
}

module.exports = {
    isEnabled,
    sendFeedback
}
