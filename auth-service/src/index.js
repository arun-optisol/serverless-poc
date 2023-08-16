const authController = require('./controllers/auth')

exports.signIn = authController.signIn
exports.signUp = authController.signUp
exports.preSignUp = authController.preSignUp