const {
  aws: { postBucket, userBucket, pUserBucket }
} = require('../../../config/config')

const uploadTypes = {
  POST: 'POST',
  USER: 'USER'
}

const uploadTypeBucket = {
  POST: postBucket,
  USER: userBucket,
  PUSER: pUserBucket
}

module.exports = {
  uploadTypes,
  uploadTypeBucket
}
