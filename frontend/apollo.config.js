require("dotenv/config")

module.exports = {
    service: {
        endpoint: {
            uri: `/api/film`,
            skipSSLValidation: true
        }
    }
}