const { v4: uuid } = require('uuid')
const s3 = require('../utils/s3')
const { uploadTypeBucket } = require('../constants/upload.constant')

const processUploadS3 = async (file, type = 'POST') => {
  const { createReadStream, mimetype: mimeType, encoding, filename } = await file
  const stream = createReadStream()
  return uploadFile(filename, stream, mimeType, encoding, type)
}

const pUserUpload = async (filename, file, stream, type = 'PUSER') => {
  const { mimetype: mimeType, encoding } = await file
  return uploadFile(filename, stream, mimeType, encoding, type)
}

const uploadFile = async (filename, stream, mimeType, encoding, type) => {
  const { Location } = await s3(uploadTypeBucket[type])
    .upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimeType,
      Bucket: uploadTypeBucket[type]
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
  processUploadS3,
  pUserUpload
}
