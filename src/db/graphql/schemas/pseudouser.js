const { gql } = require('apollo-server-express')

const pseudouserSchema = gql`
  type Mutation {
    updatePseudoUserExpertise(username: String!, expertises: [Int!]!): [PseudoUserExpertise]
    addPseudoUserExpertise(username: String!, expertises: [Int!]!): [PseudoUserExpertise]
    removePsedoUserExpertise(username: String!, expertises: [Int!]!): [PseudoUserExpertise]
  }

  type PseudoUserExpertise {
    id: Int!
    name: String!
  }
`

module.exports = pseudouserSchema
