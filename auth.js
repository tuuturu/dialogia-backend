const axios = require('axios')
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

async function getOIDCOptions(discovery_url) {
    const { data } = await axios.request({
        url: discovery_url,
        method: 'get',
    })

    return data
}

function setupMiddleware({ jwks_uri, issuer }) {
    return jwt({
        secret: jwks.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: jwks_uri
        }),
        audience: 'account',
        issuer,
        algorithms: ['RS256']
    })
}

module.exports = {
    authMiddleware: setupMiddleware,
    getOIDCOptions
}
