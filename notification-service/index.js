const AWS = require('aws-sdk')

const SES = new AWS.SES({ region: 'ap-south-1' })
const { FROM_EMAIL } = process.env
module.exports.sendMail = async (event) => {
  try {
    console.log("inside mail lambda");
    if(!FROM_EMAIL){
      console.log('Unable to send mail, missing FROM_EMAIL!');
      return 'Unable to send mail, missing FROM_EMAIL!'
    }
    const record = event.Records[0]
    console.log(JSON.stringify(event.Records[0], null, 2));
    const email = JSON.parse(record.body)
    const {subject, body, recipient} = email
    const params = {
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [recipient]
      },
      Message: {
        Body: {
          Text: {
            Data: body
          }
        },
        Subject: {
          Data: subject
        }
      }
    }
    const result = await SES.sendEmail(params).promise()
    console.log(result);
    return result
  } catch (error) {
    console.error("mail error::", error)
    return JSON.stringify(error, null, 2)
  }
}
