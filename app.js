const express = require('express');
const logger = require('morgan');
const sendFeedback = require('./feedbackSender');
const slackSender = require('./slackSender')
const authMiddleware = require('./auth.js');

const PORT = 3000;
const BASE_ENTRYPOINT = '/feedback';
const HEALTH_ENDPOINT = '/health';

const app = express();

var unless = function(path, middleware) {
    return function(req, res, next) {
        if (path === req.path) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};

app.disable('etag')
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(unless(HEALTH_ENDPOINT, authMiddleware));

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid or missing token...');
    }
});

app.post(BASE_ENTRYPOINT, function (req, res) {
    const body = req.body;
    if (!body || !body.text) {
        res.status(400).send('text attribute required!');
    } else if (body.text.length < 5 || body.text.length > 500) {
        res.status(400).send('text attribute needs to be between 5 and 500 characters!');
    } else {
    	  let status = 200
			  const errors = []

        if (process.env.SLACK_WEBHOOK_URL)
            slackSender(body.text, error => {
                if (error) {
                    status = 500
                    errors.push(error)
                }
            })
			  if (process.env.EMAIL_API_ENDPOINT_URL && process.env.EMAIL_API_API_KEY)
            sendFeedback(body.text, error => {
                if (error) {
                    status = 500
                    errors.push(error)
                }
            })

        res.status(status).json({ errors })
    }
});

app.get(HEALTH_ENDPOINT, function (req, res) {
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server started listening on port ${PORT}`)
});
