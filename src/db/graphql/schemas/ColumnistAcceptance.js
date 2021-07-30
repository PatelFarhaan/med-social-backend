const { gql } = require('apollo-server-express')

const ColumnistAcceptance = gql`
  type Query {
    RetrieveStripeStatus: StripeStatus
  }
  type Mutation {
    ConnectColumnistToStripe(return_url: String!, refresh_url: String!): StripeUrl
  }

  type StripeUrl {
    ConnectUrl: String
  }

  type StripeStatus {
    Status: Boolean
    Errors: String
  }
`

module.exports = ColumnistAcceptance
