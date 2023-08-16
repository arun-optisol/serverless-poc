const AWS = require('aws-sdk')

const db = new AWS.DynamoDB.DocumentClient()
const SQS = new AWS.SQS()
const TableName = process.env.AUCTIONS_TABLE_NAME
const QueueUrl = process.env.MAIL_QUEUE_URL

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
      let sellerNotifications = []
      let bidderNotifications = []
      const finalAuctionsToClose = auctionsToClose.Items.map((auction) => {
        if(QueueUrl){
          let { title, seller, highestBid } = auction
          let { amount, bidder } = highestBid
          sellerNotifications.push(SQS.sendMessage({
            QueueUrl,
            MessageBody: JSON.stringify({
              subject: `Your item has been sold. Auction Id #${auction.id}`,
              recipient: seller,
              body: `Great! Your item ${title} has been sold for ${amount}.`
            })
          }).promise())
          if(bidder){
            bidderNotifications.push(SQS.sendMessage({
              QueueUrl,
              MessageBody: JSON.stringify({
                subject: `You won a auction. Auction Id #${auction.id}`,
                recipient: bidder,
                body: 'You won a auction'
              })
            }).promise())
          }
        }
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
      if(sellerNotifications.length){
        await Promise.all(sellerNotifications)
      }
      if(bidderNotifications.length){
        await Promise.all(bidderNotifications)
      }
    }else{
      console.log('No auctions found to close.');
    }
    return { auctionsClosed: auctionsToClose.Items.length }
  } catch (error) {
    console.error(error)
    return 'Error'
  }
}
