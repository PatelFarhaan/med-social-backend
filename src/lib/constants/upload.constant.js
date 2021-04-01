const {
  aws: { postBucket, userBucket }
} = require('../../../config/config')

const uploadTypes = {
  POST: 'POST',
  USER: 'USER'
}

const uploadTypeBucket = {
  POST: postBucket,
  USER: userBucket
}

module.exports = {
  uploadTypes,
  uploadTypeBucket
}
