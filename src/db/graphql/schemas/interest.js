const { gql } = require('apollo-server-express')

const interestSchema = gql`
  type Query {
    getInterests(page: Int, limit: Int, sortBy: String, sortDirection: String): Interests
    getInterest(id: Int): Interest
  }

  type Mutation {
    createInterest(name: String): Interest
  }

  type Interests {
    list: [Interest]
    count: Int!
  }

  type Interest {
    id: Int
    name: String
    createdAt: DateTime
    expertises: [Expertise]
  }
`

module.exports = interestSchema
