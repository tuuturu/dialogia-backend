'use strict';

const express = require('express');
const logger = require('morgan');
const sendFeedback = require('./feedbackSender');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.post('/feedback', function ({ body }, res) {
    if (!body) {
        res.status(400).send('text attribute required!');
    } else if (body.text.length < 5 || body.text.length > 500) {
        res.status(400).send('text attribute needs to be between 5 and 500 characters!');
    } else {
        sendFeedback(body.text, (error, data) => {
            if (error) {
                res.status(500).send("Unexpected error occurred");
            } else {
                res.send(data);
            }
        });
    }
});

app.listen(3000);
