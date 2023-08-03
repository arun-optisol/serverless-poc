const { v4: uuid } = require('uuid')
const AWS = require('aws-sdk')

const middy = require('@middy/core')
const httpBodyParser = require('@middy/http-json-body-parser')
const httpEventNormalizer = require('@middy/http-event-normalizer')
const httpErrorHandler = require('@middy/http-error-handler')
const httpError = require('http-errors')

const db = new AWS.DynamoDB.DocumentClient()

let createAuction = async function (event, context) {
  try {
    const body = event.body
    const createdAt = new Date()
    const auction = {
      id: uuid(),
      title: body.title,
      status: 'OPEN',
      createdAt: createdAt.toISOString()
    }

    let res = await db
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction
      })
      .promise()
    return {
      statusCode: 201,
      body: JSON.stringify(auction)
    }
  } catch (error) {
    console.error(error)
    return new httpError.InternalServerError(error)
  }
}
let getAuctions = async function (event, context) {
  try {
    let res = await db.scan({
        TableName: process.env.AUCTIONS_TABLE_NAME
    }).promise()
    return {
        statusCode: 200,
        body: JSON.stringify(res.Items)
    }
  } catch (error) {
    console.error(error)
    return new httpError.InternalServerError(error)
  }
}

exports.createAuction = middy(createAuction)
  .use(httpBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
exports.getAuctions = middy(getAuctions)
  .use(httpBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
