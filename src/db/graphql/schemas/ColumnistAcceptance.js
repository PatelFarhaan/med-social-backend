const { gql } = require('apollo-server-express')

const ColumnistAcceptance = gql`
  type Query {
    RetrieveStripeStatus: Boolean
  }
  type Mutation {
    ConnectColumnistToStripe(return_url: String!, refresh_url: String!): StripeUrl
  }

  type StripeUrl {
    ConnectUrl: String
  }
`

module.exports = ColumnistAcceptance
