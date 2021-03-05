const nodemailer = require('nodemailer')
const aws = require('@aws-sdk/client-ses')
const Email = require('email-templates')
const {
  aws: { region },
  env,
  email: { from }
} = require('../../../config/config')
const logger = require('../utils/logger')

// configure AWS SDK
const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region
})

// create Nodemailer SES transporter
const transport = nodemailer.createTransport({
  SES: { ses, aws }
})

if (env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'))
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, locals, template) => {
  const email = new Email({
    message: {
      from
    },
    send: env === 'production',
    transport:
      env === 'production'
        ? transport
        : {
            jsonTransport: true
          },
    preview: env === 'production' ? null : { open: { app: 'chrome' } }
  })

  email
    .send({
      template,
      message: {
        to
      },
      locals
    })
    .then(logger.log)
    .catch(logger.error)
}

module.exports = {
  transport,
  sendEmail
}
