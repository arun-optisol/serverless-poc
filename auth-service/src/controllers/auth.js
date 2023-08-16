const AWS = require('aws-sdk')

const congnito = new AWS.CognitoIdentityServiceProvider()

let preSignUp = async function(event){
    try {
        event.response.autoConfirmUser = true
        event.response.autoVerifyEmail = true
        return event
    } catch (error) {
        throw error
    }
}

let signUp = async function (event, context) {
  try {
    const { email, password } = JSON.parse(event.body)
    const { userPoolId, userPoolClientId } = process.env
    if (!email || !password) {
      return {
        statusCode: 400,
        body: 'Email and password is required'
      }
    }
    console.log(`email:::${email}:::password:::${password}:::`)
    let params = {
      //   UserPoolId: userPoolId,
      ClientId: userPoolClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        }
      ]
    }
    console.log(JSON.stringify(params, null, 2));
    const authResult = await congnito.signUp(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify(authResult)
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}
let signIn = async function (event, context) {
  try {
    const { email, password } = JSON.parse(event.body)
    const { userPoolId, userPoolClientId } = process.env
    if (!email || !password) {
      return {
        statusCode: 400,
        body: 'Email and password is required'
      }
    }
    console.log(`email:::${email}:::password:::${password}:::`)
    let params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      //   UserPoolId: userPoolId,
      ClientId: userPoolClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    }
    console.log(JSON.stringify(params, null, 2));
    const authResult = await congnito.initiateAuth(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify(authResult)
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}

exports.signIn = signIn
exports.signUp = signUp
exports.preSignUp = preSignUp
