const { gql } = require('apollo-server-express')

const columnSchema = gql`
  type Query {
    getColumn(slug: String!): Column
    listColumns(interests: [Int], page: Int, limit: Int, sortBy: String, sortDirection: String, includeNonApproved: Boolean): Columns
    listPopularColumns(page: Int, limit: Int, sortBy: String, sortDirection: String): Columns
    searchColumns(query: String!, page: Int, limit: Int): [Column]
    isUserSubscribedToColumn(column: String!): Boolean!
    popularColumnists: [Column]
    topColumns(page: Int, limit: Int): [Column]
  }

  type Mutation {
    createColumn(
      name: String!
      description: String!
      interests: [Int]
      expertise: Int
      type: columnTypes
      price: Float
      visibility: columnVisibility
    ): Column
    subscribeToColumn(slug: String!): Subscription
    unsubscribeToColumn(slug: String!): DefaultPayload
    banUser(slug: String!, bannedUserId: String!): DefaultPayload
  }

  type Column {
    slug: String
    name: String!
    description: String!
    interests(page: Int, limit: Int): [Interest]
    expertise: Expertise
    subscriptions(page: Int, limit: Int): [Subscription]
    price: Float
    type: columnTypes
    visibility: columnVisibility
    state: columnStatuses
    bannedMembers(page: Int, limit: Int): [User]
    PostCount: Int
    MemberCount: Int
    author: User
    topPeople: User
  }

  enum columnVisibility {
    PUBLIC
    PRIVATE
  }

  enum columnStatuses {
    PENDING
    APPROVED
    REJECTED
    REVIEWED
    CANCELED
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
    user: User
  }
`

module.exports = columnSchema
