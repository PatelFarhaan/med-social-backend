const { gql } = require('apollo-server-express')

const columnSchema = gql`
  type Query {
    getColumn(slug: String!): Column
    listColumns(page: Int, limit: Int, sortBy: String, sortDirection: String, includeNonApproved: Boolean): Columns
    searchColumns(query: String): [Column]
  }

  type Mutation {
    createColumn(name: String!, description: String!, interests: [Int], type: columnTypes): Column
    subscribeToColumn(slug: String!): Subscription
  }

  type Column {
    slug: String
    name: String!
    description: String!
    interests(page: Int, limit: Int): [Interest]
    subscriptions(page: Int, limit: Int): [Subscription]
    type: String
  }

  enum columnTypes {
    PAID
    FREE
  }

  type Columns {
    list: [Column]
    count: Int!
  }

  type Subscription {
    id: Int!
    createdAt: DateTime
    updatedAt: DateTime
    paymentGateway: String
    type: String
    email: String
    state: String
    amountPerCycle: Int
    cycle: String
    cycleLength: Int
    users: [User]
  }
`

module.exports = columnSchema
