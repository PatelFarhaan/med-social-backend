const { gql } = require('apollo-server-express')

const postSchema = gql`
  type Query {
    getPost(id: Int!): Column
    listPosts(column: String, page: Int, limit: Int, sortBy: String, sortDirection: String): Posts
    searchPosts(query: String): [Post]
  }

  type Mutation {
    createPost(column: String, content: String!, isStacked: Boolean, isQuoted: Boolean, stackedPosts: [StackedPostInput]): Post
  }

  input StackedPostInput {
    content: String!
  }

  type Post {
    id: String!
    content: String!
    isStacked: Boolean
    isQuoted: Boolean
    author: User
    updatedAt: DateTime
    createdAt: DateTime
    votes: Int
    stackedPosts: [Post]
  }

  type Posts {
    list: [Post]
    count: Int!
  }
`

module.exports = postSchema
