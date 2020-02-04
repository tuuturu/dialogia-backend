const envConfig = require('./envConfig');
const request = require('request');

const sendFeedback = (message, callback) => {

    const requestBody = {
        mottakerepost: [envConfig.recipientEmailAddress],
        avsenderepost: envConfig.recipientEmailAddress,
        emne: 'New feedback from developer portal',
        meldingskropp: message
    };

    request({
        url: envConfig.emailApiEnpointUrl,
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "apikey": envConfig.emailApiApiKey
        },
        json: requestBody}, (error, response) => {
        if (response.statusCode === 200) {
            callback(undefined, 'Message sent!');
        } else {
            console.error('error:', error);
            console.error('statusCode:', response.statusCode);
            callback(error, undefined);
        }
    });

};

module.exports = sendFeedback;