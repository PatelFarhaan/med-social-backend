const { gql } = require('apollo-server-express')

const userSchema = gql`
  type Query {
    login(email: String!, password: String, token: String): Session
    getUser(id: String!): User
    getUsers(page: Int, limit: Int, sortBy: String, sortDirection: String): Users
    getMagicLink(email: String!): DefaultPayload
    socialLogin(token: String!, provider: socialProviders!): Session
    socialOnboarding(token: String!, provider: socialProviders!): socialGoogleOnboarding
    searchByUsername(query: String!): [User]
    isUsernameTaken(query: String!): Boolean
    getUserColumns(page: Int, limit: Int): [Column]
  }

  type socialGoogleOnboarding {
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

  type Mutation {
    updateUser(email: String!): User
    createUser(
      email: String!
      firstName: String!
      lastName: String
      username: String!
      password: String
      passwordRepeat: String
      roleId: Int!
      expertises: [Int]
      interests: [Int]
      token: String!
      twitterUserId: String
      googleUserId: String
    ): Session
    refreshAuth(refreshToken: String!): Session
    connectSocial(token: String!, provider: socialProviders!): User
    disconnectSocial(token: String!, provider: socialProviders!): User
    connectPaymentMethod(paymentMethod: StripePaymentMethod!): User
    uploadProfilePicture(file: Upload!): User
    setPassword(password: String!): User
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

  type UserExpertise {
    id: Int
    totalPoints: Int
    isPrimary: Boolean
    isSecondary: Boolean
    user: User
    expertise: Expertise
  }

  type UserPaymentMethod {
    id: String
    name: String
    brend: String
    expire_year: Int
    last_digits: String
    expire_month: Int
  }

  type User {
    id: String
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
    userExpertises: [UserExpertise]
    paymentMethod: UserPaymentMethod
  }
`

module.exports = userSchema
