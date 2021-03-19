const columnVisibilities = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE'
}

const columnStatuses = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVIEWED: 'REVIEWED',
  CANCELED: 'CANCELED'
}

const columnTypes = {
  PAID: 'PAID',
  FREE: 'FREE'
}

const columnMinPrice = 5

const columnMaxPrice = 2000

module.exports = {
  columnVisibilities,
  columnStatuses,
  columnMinPrice,
  columnMaxPrice,
  columnTypes
}
