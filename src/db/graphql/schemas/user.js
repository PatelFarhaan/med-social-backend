const { gql } = require('apollo-server-express')

const userSchema = gql`
  type Query {
    login(email: String!, password: String!): Session
    getUser(id: Int): User
    getUsers(page: Int, limit: Int, sortBy: String, sortDirection: String): Users
    sendEmail: TempEmail
  }

  type TempEmail {
    status: String
  }

  type Mutation {
    updateUser(id: Int, settings: JSON!): User
    createUser(
      email: String!
      firstName: String!
      lastName: String!
      password: String!
      passwordRepeat: String!
      roleId: Int!
      expertises: [Int]
      interests: [Int]
      token: String!
    ): Session
    refreshAuth(refreshToken: String!): Session
  }

  type Users {
    list: [User]
    count: Int!
  }

  type Session {
    user: User!
    tokens: Tokens!
  }

  type Tokens {
    access: Token
    refresh: Token
  }

  type Token {
    token: String
    expires: DateTime
  }

  type User {
    id: Int
    email: String!
    lookupId: String!
    fullName: String
    firstName: String
    lastName: String
    username: String
    profilePicture: String
    profileDescription: String
    isAnonymousUser: Boolean
    notificationsSeenAt: DateTime
    settings: JSON!
    expertises: [Expertise]
    interests: [Interest]
    invitedBy: [User]
  }
`

module.exports = userSchema
