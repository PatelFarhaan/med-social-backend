const subscriptionTypes = {
  PAID_INVITATION: 'PAID_INVITATION',
  COLUMN: 'COLUMN'
}

const paymentGateways = {
  STRIPE: 'STRIPE'
}

const subscriptionStatuses = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING'
}

module.exports = {
  subscriptionTypes,
  paymentGateways,
  subscriptionStatuses
}
