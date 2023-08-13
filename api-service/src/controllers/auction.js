const { v4: uuid } = require('uuid')
const httpError = require('http-errors')
const commonMiddleware = require('../middleware/commonMiddleware')


const auctionDB = require('../db/auction')
const schema = require('../schema/auctions.json')

let createAuction = async function (event, context) {
  try {
    const body = event.body
    const now = new Date()
    const endDate = new Date()
    endDate.setHours(now.getHours() + 1)
    const auction = {
      id: uuid(),
      title: body.title,
      status: 'OPEN',
      createdAt: now.toISOString(),
      endingAt: endDate.toISOString(),
      highestBid: {
        amount: 0
      }
    }
    await auctionDB.createAuction(auction)
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
    let { status } = event.queryStringParameters
    if(!status) status = 'OPEN'
    let auctions = await auctionDB.getAllAuction(status)
    return {
      statusCode: 200,
      body: JSON.stringify(auctions)
    }
  } catch (error) {
    console.error(error)
    return new httpError.InternalServerError(error)
  }
}

let getAuction = async function (event, context) {
  try {
    const { id } = event.pathParameters
    let auction = await auctionDB.getAuctionById({ id })
    if (!auction) {
      return new httpError.NotFound(`Auction with ${id} not found.`)
    }
    return {
      statusCode: 200,
      body: JSON.stringify(auction)
    }
  } catch (error) {
    console.error(error)
    return new httpError.InternalServerError(error)
  }
}

let placeBid = async function (event, context) {
  try {
    const { id } = event.pathParameters
    const { amount } = event.body
    let auction = await auctionDB.getAuctionById({ id })
    if (!auction) {
      return new httpError.NotFound(`Auction with ${id} not found.`)
    }
    if (amount <= auction.highestBid.amount) {
      return new httpError.Forbidden(
        `Your bid must be higher than ${auction.highestBid.amount}`
      )
    }
    if (auction.status !== 'OPEN') {
      return new httpError.Forbidden(`Auction is not in open state.`)
    }
    const params = {
      Key: { id },
      UpdateExpression: 'SET highestBid.amount = :amount',
      ExpressionAttributeValues: {
        ':amount': amount
      },
      ReturnValues: 'ALL_NEW'
    }
    let res = await auctionDB.updateAuction(params)
    if (!res) {
      return new httpError.NotFound(`Auction with ${id} not found.`)
    }
    return {
      statusCode: 200,
      body: JSON.stringify(res)
    }
  } catch (error) {
    console.error(error)
    return new httpError.InternalServerError(error)
  }
}

exports.createAuction = commonMiddleware(createAuction)
exports.getAuctions = commonMiddleware(getAuctions)
exports.getAuction = commonMiddleware(getAuction)
exports.placeBid = commonMiddleware(placeBid)
