const { gql } = require('apollo-server-express')

const expertiseSchema = gql`
  type Query {
    getExpertise(id: Int): Expertise
    getExpertises(page: Int, limit: Int, sortBy: String, sortDirection: String): Expertises
  }

  type Mutation {
    createExpertise(name: String, interests: [Int]): Expertise
  }

  input InterestInput {
    id: Int
    name: String
  }

  type Expertise {
    id: Int
    name: String!
    interests(page: Int, limit: Int): [Interest]
  }

  type Expertises {
    list: [Expertise]
    count: Int!
  }
`

module.exports = expertiseSchema
