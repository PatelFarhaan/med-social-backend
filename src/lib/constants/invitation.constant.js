const states = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CLOSED: 'CLOSED',
  COMPLETED: 'COMPLETED',
  REQUESTED: 'REQUESTED'
}

const conludedStates = [states.EXPIRED, states.COMPLETED, states.CLOSED, states.REJECTED]

const subscriptionModels = {
  FREE: 'FREE',
  PAID: 'PAID'
}

const invitationTypes = {
  REGULAR: 'REGULAR',
  PAID: 'PAID',
  FELLOW: 'FELLOW'
}

module.exports = {
  states,
  conludedStates,
  subscriptionModels,
  invitationTypes
}
