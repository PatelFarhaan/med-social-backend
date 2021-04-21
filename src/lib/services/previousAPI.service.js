const axios = require('axios')

const authenticate = async (email, password) => {
  const response = await axios({
    method: 'POST',
    url: 'https://api.joincolumn.com/api/v1/api-token-auth/',
    data: { username: email, password },
    validateStatus(status) {
      return status >= 200 && status < 500 // default
    }
  })
  return !!response.data.token
}

module.exports = {
  authenticate
}
