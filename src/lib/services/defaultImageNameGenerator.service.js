const bcrypt = require('bcrypt')
const UrlSafeString = require('url-safe-string')

const tagGenerator = new UrlSafeString()

const encode = async message => {
  const salt = await bcrypt.genSalt(5)
  const encoded = await bcrypt.hash(message, salt)
  return tagGenerator.generate(encoded)
}

module.exports = {
  encode
}
