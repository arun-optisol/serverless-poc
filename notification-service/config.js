const dotenv = require('dotenv')

module.exports = () => {
  const envVars = dotenv.config({ path: '.env' }).parsed
  console.log(envVars)
  return envVars
}
