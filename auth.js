const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const envConfig = require('./envConfig');

const keycloakAuthUrl = envConfig.keycloakAuthServerUrl;

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${envConfig.keycloakAuthServerUrl}/realms/api-catalog/protocol/openid-connect/certs`
    }),
    audience: 'account',
    issuer: `${envConfig.keycloakAuthServerUrl}/realms/api-catalog`,
    algorithms: ['RS256']
});

module.exports = jwtCheck;