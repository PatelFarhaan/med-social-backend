const nodemailer = require('nodemailer')
const aws = require('@aws-sdk/client-ses')
const path = require('path')
const Email = require('email-templates')
const {
  aws: { region },
  env,
  email: { from }
} = require('../../../config/config')

// configure AWS SDK
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region
})

// create Nodemailer SES transporter
const transporter = nodemailer.createTransport({
  SES: { ses, aws }
})

// if (env !== 'test') {
//   transporter
//     .verify()
//     .then(() => logger.info('Connected to email server'))
//     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'))
// }

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, locals, template) => {
  const root = path.join(process.cwd(), '/src/lib/templates')
  const email = new Email({
    message: {
      from
    },
    views: {
      root
    },
    send: env === 'production',
    transport: transporter,
    preview: env === 'production' ? null : null
  })

  const { MOCK_SERVER_HOST, MOCK_SERVER_PORT, MOCK_SERVER_PROTOCOL } = process.env

  email
    .send({
      template,
      message: {
        to
      },
      locals: {
        absoluteUrl: `${MOCK_SERVER_PROTOCOL}://${MOCK_SERVER_HOST}:${MOCK_SERVER_PORT}`,
        ...locals
      }
    })
    .then(console.log)
    .catch(console.error)
}

module.exports = {
  transporter,
  sendEmail
}
