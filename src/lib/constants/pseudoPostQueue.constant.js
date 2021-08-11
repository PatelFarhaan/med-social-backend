const queueStatuses = {
  ACTIVE: 'ACTIVE',
  STALLED: 'STALLED',
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING'
}

const QUEUE_POST_LIMIT = 10

const QUEUE_RUN_FREQUENCY = 1

module.exports = {
  queueStatuses,
  QUEUE_POST_LIMIT,
  QUEUE_RUN_FREQUENCY
}
