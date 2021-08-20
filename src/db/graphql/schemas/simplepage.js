const { gql } = require('apollo-server-express')

const simplepageSchema = gql`
  type Query {
    getSimplepage(id: Int!): Simplepage
    getAllSimplepages(page: Int, limit: Int): [Simplepage]
  }

  type Mutation {
    createSimplepage(pageName: String, effectiveDate: DateTime, content: String): Simplepage
    updateSimplepage(pageName: String, id: Int!, effectiveDate: DateTime, content: String): Simplepage
  }

  type Simplepage {
    id: Int
    pageName: String
    slug: String
    effectiveDate: DateTime
    content: String
  }
`

module.exports = simplepageSchema
