const subscriptionTypes = {
  PAID_INVITATION: 'PAID_INVITATION',
  COLUMN: 'COLUMN',
  USER: 'USER'
}

const paymentGateways = {
  STRIPE: 'STRIPE'
}

const subscriptionStatuses = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING'
}

const subscriptionCycles = {
  DAY: 'DAY',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  ANNUAL: 'ANNUAL',
  FOREVER: 'FOREVER'
}

module.exports = {
  subscriptionTypes,
  paymentGateways,
  subscriptionStatuses,
  subscriptionCycles
}
