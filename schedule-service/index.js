const AWS = require('aws-sdk')

const db = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.AUCTIONS_TABLE_NAME

module.exports.handler = async (event) => {
  try {
    const now = new Date()
    const params = {
      TableName,
      IndexName: 'statusAndEndDate',
      KeyConditionExpression: '#status = :status and endingAt <= :now',
      ExpressionAttributeValues: {
        ':status': 'OPEN',
        ':now': now.toISOString()
      },
      ExpressionAttributeNames: {
        '#status': 'status'
      }
    }
    const auctionsToClose = await db.query(params).promise()
    if (auctionsToClose.Items.length) {
      const finalAuctionsToClose = auctionsToClose.Items.map((auction) => {
        return db
          .update({
            TableName,
            Key: { id: auction.id },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeValues: {
              ':status': 'CLOSED'
            },
            ExpressionAttributeNames: {
              '#status': 'status'
            }
          })
          .promise()
      })
      await Promise.all(finalAuctionsToClose)
    }
    return { auctionsClosed: auctionsToClose.Items.length }
  } catch (error) {
    console.error(error)
    return 'Error'
  }
}
