const { gql } = require('apollo-server-express')

const userSchema = gql`
  type Query {
    login(email: String!, password: String, token: String): Session
    getUser(id: Int): User
    getUsers(page: Int, limit: Int, sortBy: String, sortDirection: String): Users
    getMagicLink(email: String!): DefaultPayload
    socialLogin(token: String!, provider: socialProviders!): Session
    socialOnboarding(token: String!, provider: socialProviders!): socialGooglePayload
  }

  type socialGooglePayload {
    id: String
    attributes: socialGoogleAttributes
  }

  type socialGoogleAttributes {
    envelope: String
    payload: socialGooglePayload
  }

  type socialGooglePayload {
    iss: String
    at_has: String
    email_verified: Boolean
    sub: String
    azp: String
    email: String
    profile: String
    picture: String
    name: String
    given_name: String
    family_name: String
    aud: String
    hd: String
    nonce: String
    iat: Int
    exp: Int
    locale: String
  }

  enum socialProviders {
    google
  }

  type DefaultPayload {
    status: Int
    message: String
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
    connectSocial(token: String!, provider: socialProviders!): User
    disconnectSocial(token: String!, provider: socialProviders!): User
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
