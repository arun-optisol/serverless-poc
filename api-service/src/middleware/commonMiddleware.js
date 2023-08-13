const middy = require('@middy/core')
const httpBodyParser = require('@middy/http-json-body-parser')
const httpEventNormalizer = require('@middy/http-event-normalizer')
const httpErrorHandler = require('@middy/http-error-handler')

module.exports = (handler) =>
  middy(handler).use([
    httpBodyParser(),
    httpEventNormalizer(),
    httpErrorHandler()
  ])
