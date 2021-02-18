module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 30,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
    resetPasswordExpirationMinutes: 10
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    },
    from: process.env.EMAIL_FROM
  }
}
