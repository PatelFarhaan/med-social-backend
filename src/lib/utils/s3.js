const S3 = require('aws-sdk/clients/s3')
const {
  aws: { accessKeyId, secretAccessKey, region, s3Bucket }
} = require('../../../config/config')

const s3 = new S3({
  bucketName: s3Bucket,
  accessKeyId,
  secretAccessKey,
  region
})

module.exports = s3
