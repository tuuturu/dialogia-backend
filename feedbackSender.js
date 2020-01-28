'use strict';

const request = require('request');

const recipientEmailAddress = 'developerportal@oslo.kommune.no';
const emailAPIKey = 'TODO'; //TODO switch
const emailAPIEndpoint = 'https://email-test.api-test.oslo.kommune.no/email';

const sendFeedback = (message, callback) => {

    const requestBody = {
        mottakerepost: [recipientEmailAddress],
        avsenderepost: recipientEmailAddress,
        emne: 'New feedback from developer portal',
        meldingskropp: message
    };

    request({
        url: emailAPIEndpoint,
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "apikey": emailAPIKey
        },
        json: requestBody}, (error, response) => {
        if (response.statusCode === 200) {
            callback(undefined, 'Message sent!');
        } else {
            console.log('error:', error);
            console.log('statusCode:', response.statusCode);
            callback(error, undefined);
        }
    });

};

module.exports = sendFeedback;