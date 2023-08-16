let util = {
    sendReponse: (statusCode, response) => {
        return {
            statusCode,
            body: JSON.stringify(response)
        }
    }
}

module.exports = util