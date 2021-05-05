const S3 = require('aws-sdk/clients/s3')
const {
  aws: { accessKeyId, secretAccessKey, region }
} = require('../../../config/config')

const s3 = bucketName =>
  new S3({
    bucketName,
    accessKeyId,
    secretAccessKey,
    region,
    params: {
      ACL: 'public-read',
      Bucket: bucketName
    }
  })

module.exports = s3
