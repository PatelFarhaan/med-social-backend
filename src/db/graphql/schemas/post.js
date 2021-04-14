const { gql } = require('apollo-server-express')

const postSchema = gql`
  type Query {
    getPost(id: Int!, hierarchy: Boolean): Post
    listColumnPosts(column: String, page: Int, limit: Int, sortBy: String, sortDirection: String, hierarchy: Boolean): Posts
    listUserPosts(page: Int, limit: Int, sortBy: String, sortDirection: String, hierarchy: Boolean): Posts
    searchPosts(query: String): [Post]
  }

  type Mutation {
    createPost(
      column: String
      content: String!
      isQuoted: Boolean
      quoted_post: Int
      stackedPosts: [StackedPostInput]
      files: [Upload]
    ): Post
    createComment(content: String!, id: Int!): Post
    createPostBookmark(id: String!): Post
    deletePost(id: Int!): DefaultPayload
    createPostVote(id: Int!, type: voteTypes): Post
    editPost(id: Int!, content: String!): Post
    reportPost(id: Int!, reason: String!): DefaultPayload
    reviewPost(id: Int!, state: reportedContentStatuses!): DefaultPayload
  }

  enum reportedContentStatuses {
    APPROVED
    REJECTED
  }

  enum voteTypes {
    UP
    DOWN
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
    order: Int
    stackedPosts(limit: Int, page: Int, hierarchy: Boolean): [Post]
    children: String
    hierarchyLevel: Int
    files: [File]
    column: Column
  }

  type File {
    mimetype: String
    filename: String
    location: String!
    updatedAt: DateTime
    createdAt: DateTime
    post: Post
    column: Column
    user: User
  }

  type Posts {
    list: [Post]
    count: Int!
  }
`

module.exports = postSchema
