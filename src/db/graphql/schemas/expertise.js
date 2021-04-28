const { gql } = require('apollo-server-express')

const expertiseSchema = gql`
  type Query {
    getExpertise(id: Int!): Expertise
    getExpertises(page: Int, limit: Int, sortBy: String, sortDirection: String, includeNonApproved: Boolean): Expertises
    searchExpertises(query: String): [Expertise],
    getExpertiseRankingTable: RankingTable
  }

  type Mutation {
    createExpertise(name: String!, interests: [Int!]): Expertise
  }

  type RankingTable {
    1: Int
    2: Int
    3: Int
    4: Int
    5: Int
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
