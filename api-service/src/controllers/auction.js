const { v4: uuid } = require('uuid')
const httpError = require('http-errors')
const commonMiddleware = require('../middleware/commonMiddleware')

const auctionDB = require('../db/auction')
const util = require('../util/util')
const schema = require('../schema/auctions.json')

let createAuction = async function (event, context) {
  try {
    const body = event.body
    const claims = event.requestContext.authorizer.claims
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
      },
      seller: claims.email
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
    if (!status) status = 'OPEN'
    if (status !== 'OPEN' && status !== 'CLOSED') {
      return {
        statusCode: 400,
        body: 'Invalid Status'
      }
    }
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
    const claims = event.requestContext.authorizer.claims
    let auction = await auctionDB.getAuctionById({ id })
    if (!auction) {
      return util.sendReponse(
        400,
        new httpError.NotFound(`Auction with ${id} not found.`)
      )
    }
    if (auction.status !== 'OPEN') {
      return util.sendReponse(
        403,
        new httpError.Forbidden(`Auction is not in open state.`)
      )
    }
    if (auction.seller == claims.email) {
      return util.sendReponse(
        403,
        new httpError.Forbidden(`You cannot bid your own auctions!`)
      )
    }
    if (auction.highestBid.bidder == claims.email) {
      return util.sendReponse(
        403,
        new httpError.Forbidden(`You are aleady highest bidder!`)
      )
    }
    if (amount <= auction.highestBid.amount) {
      return util.sendReponse(
        403,
        new httpError.Forbidden(
          `Your bid must be higher than ${auction.highestBid.amount}`
        )
      )
    }
    const params = {
      Key: { id },
      UpdateExpression:
        'SET highestBid.amount = :amount, highestBid.bidder = :bidder',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':bidder': claims.email
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
