const getEnvVariable = (variable) => {
    if (!variable) {
        throw new Error('required env variables are not set');
    } else {
        return variable;
    }
};

module.exports = {
    emailApiApiKey: getEnvVariable(process.env.EMAIL_API_API_KEY),
    recipientEmailAddress: getEnvVariable(process.env.RECIPIENT_EMAIL_ADDRESS),
    emailApiEnpointUrl: getEnvVariable(process.env.EMAIL_API_ENDPOINT_URL),
    keycloakAuthServerUrl: getEnvVariable(process.env.KEYCLOAK_AUTH_URL)
};