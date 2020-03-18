require('dotenv').config()
const express = require('express');
const logger = require('morgan');
const sendFeedback = require('./feedbackSender');
const authMiddleware = require('./auth.js');

const PORT = 3000;
const BASE_ENTRYPOINT = '/feedback';
const HEALTH_ENDPOINT = '/health';

const app = express();

app.disable('etag')
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid or missing token...');
    }
});

app.post(BASE_ENTRYPOINT, authMiddleware, function (req, res) {
    const body = req.body;
    if (!body || !body.text) {
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

app.get(HEALTH_ENDPOINT, function (req, res) {
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server started listening on port ${PORT}`)
});
