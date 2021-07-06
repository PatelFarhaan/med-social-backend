const { gql } = require('apollo-server-express')

const pseudouserSchema = gql`
  type Mutation {
    updatePseudoUserExpertise(username: String!, expertises: [ID!]!): [PseudoUserExpertise]
    # addPseudoUserExpertise(expertises: [ExpertiseInput]!): [Expertise]
    # removePsedoUserExpertise(expertises: [ExpertiseInput]!): [Expertise]
  }

  input ExpertiseInput {
    id: ID!
  }

  type PseudoUserExpertise {
    id: ID!
    name: String!
  }
`

module.exports = pseudouserSchema
