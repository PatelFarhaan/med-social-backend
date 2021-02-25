const { gql } = require('apollo-server-express')

const invitationSchema = gql`
  type Query {
    getInvitation(token: String!): Invitation
    getInvitations(page: Int, limit: Int, sortBy: String, sortDirection: String, includeNonApproved: Boolean): Invitations
  }

  type Mutation {
    requestInvitation(firstName: String!, lastName: String!, email: String!, expertise: String!): Invitation
    approveInvitation(email: String!): Invitation
  }

  type Invitations {
    list: [Invitation]
    count: Int!
  }

  type Invitation {
    firstName: String
    lastName: String
    email: String
    token: String
    state: String
    expertises: [Expertise]
  }
`

module.exports = invitationSchema
