require("dotenv/config")

module.exports = {
    service: {
        endpoint: {
            uri: `http://localhost:8010/api/film`,
            skipSSLValidation: true
        }
    }
}