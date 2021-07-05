const { gql } = require('apollo-server-express')

const pseudouserSchema = gql`
  type Mutation {
    updatePseudoUserExpertise(username: String!, expertises: [ExpertiseInput]!): [PseudoUserExpertise]
    # addPseudoUserExpertise(expertises: [ExpertiseInput]!): [Expertise]
    # removePsedoUserExpertise(expertises: [ExpertiseInput]!): [Expertise]
  }

  input ExpertiseInput {
    expertiseId: ID!
    expertiseName: String!
  }

  type PseudoUserExpertise {
    expertiseId: ID!
    expertiseName: String!
  }
`

module.exports = pseudouserSchema
