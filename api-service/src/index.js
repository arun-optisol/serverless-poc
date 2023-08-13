const healthController = require('./controllers/health')
const auctionController = require('./controllers/auction')


exports.hello = healthController.hello
exports.createAuction = auctionController.createAuction
exports.getAuctions = auctionController.getAuctions
exports.getAuction = auctionController.getAuction
exports.placeBid = auctionController.placeBid