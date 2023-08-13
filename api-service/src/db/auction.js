const AWS = require('aws-sdk')

const db = new AWS.DynamoDB.DocumentClient()
let auctionDB = {}
const TableName = process.env.AUCTIONS_TABLE_NAME

auctionDB.createAuction = async (params) => {
  try {
    await db
      .put({
        TableName,
        Item: params
      })
      .promise()
    return 'Success'
  } catch (error) {
    console.error(error)
  }
}
auctionDB.getAllAuction = async (status) => {
  try {
    let resp = await db
      .query({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: 'statusAndEndDate',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
          ':status': status
        },
        ExpressionAttributeNames: {
          '#status': 'status'
        }
      })
      .promise()
    return resp.Items
  } catch (error) {
    console.error(error)
  }
}
auctionDB.getAuctionById = async (params) => {
  try {
    let res = await db
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: params
      })
      .promise()
    return res.Item
  } catch (error) {
    console.error(error)
  }
}
auctionDB.updateAuction = async (params) => {
  try {
    let res = await db
      .update({
        TableName,
        ...params
      })
      .promise()
    return res.Attributes
  } catch (error) {
    console.error(error)
  }
}

module.exports = auctionDB
