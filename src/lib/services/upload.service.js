const { v4: uuid } = require('uuid')
const s3 = require('../utils/s3')
const {
  aws: { s3Bucket }
} = require('../../../config/config')

const processUploadS3 = async file => {
  const { createReadStream, mimetype: mimeType, encoding, filename } = await file
  const stream = createReadStream()
  const { Location } = await s3
    .upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimeType,
      Bucket: s3Bucket
    })
    .promise()
  return new Promise((resolve, reject) => {
    if (Location) {
      resolve({
        success: true,
        message: 'Uploaded',
        mimeType,
        filename,
        location: Location,
        encoding
      })
    } else {
      reject(
        new Error({
          success: false,
          message: 'Failed'
        })
      )
    }
  })
}
module.exports = {
  processUploadS3
}
