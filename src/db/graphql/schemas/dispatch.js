const { gql } = require('apollo-server-express')

const dispatchSchema = gql`
  type Query {
    getAllDispatches(page: Int, limit: Int): [Dispatch]
    getDispatch(slug: String!): Dispatch
    getAllUserDispatches(userId: ID!, page: Int, limit: Int): [Dispatch]
  }

  type Mutation {
    createDispatch(title: String!, about: String!, content: String!, imageLink: String!): Dispatch

    updateDispatch(title: String, id: Int!, about: String, content: String, imageLink: String): Dispatch

    deleteDispatch(id: Int!): DefaultPayload
  }

  type Dispatch {
    id: String
    title: String
    slug: String
    about: String
    content: String
    imageLink: String
    dispatchAuthor: User
    createdAt: DateTime
    updatedAt: DateTime
  }
`

module.exports = dispatchSchema
