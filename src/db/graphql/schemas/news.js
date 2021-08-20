const { gql } = require('apollo-server-express')

const newSchema = gql`
  type Query {
    getAllNews(page: Int, limit: Int): [News]
    getNews(slug: String!): News
    getAllUserNews(userId: ID!, page: Int, limit: Int): [News]
  }

  type Mutation {
    createNews(headline: String!, publisher: String!, link: String!): News

    updateNews(headline: String, id: Int!, publisher: String, link: String): News

    deleteNews(id: Int!): DefaultPayload
  }

  type News {
    id: String
    headline: String
    slug: String
    publisher: String
    link: String
    newsAuthor: User
    createdAt: DateTime
    updatedAt: DateTime
  }
`

module.exports = newSchema
