require('dotenv').config()
const express = require('express');
const logger = require('morgan');

const { getOIDCOptions, authMiddleware } = require('./auth')
const feedbackRouter = require('./feature/feedback/router')

const PORT = 3000;
const HEALTH_ENDPOINT = '/health';

function createApp(oidc_options) {
    const app = express();

    app.disable('etag')
    app.use(logger('dev'));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.get(HEALTH_ENDPOINT, function (req, res) {
        res.sendStatus(200);
    });

    app.use(authMiddleware(oidc_options))

    app.use('/feedback', feedbackRouter)

    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send('Invalid or missing token...');
        }
    });
    return app
}

getOIDCOptions(process.env.DISCOVERY_URL)
  .then(oidc_options => {
      const app = createApp(oidc_options)

      app.listen(PORT, () => {
          console.log(`Server started listening on port ${PORT}`)
      })
  })
