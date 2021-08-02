const { gql } = require('apollo-server-express')

const userSchema = gql`
  type Query {
    login(email: String!, password: String, token: String): Session
    getUser(id: String, username: String): User
    getUsers(page: Int, limit: Int, sortBy: String, sortDirection: String): Users
    getMagicLink(email: String!): DefaultPayload
    resetPasswordLink(email: String!): DefaultPayload
    socialLogin(token: String!, provider: socialProviders!): Session
    socialOnboarding(token: String!, provider: socialProviders!): socialGoogleOnboarding
    searchByUsername(query: String!, page: Int, limit: Int): [User]
    isUsernameTaken(query: String!): Boolean
    getUserColumns(page: Int, limit: Int): [Column]
    listPaymentMethods(page: Int, limit: Int): UserPaymentMethods
  }

  type Mutation {
    updateUser(profile_description: String, title: String, social_link: SocialLinkInput, custom_link: [LinkInput]): User
    updateEmail(email: String!): DefaultPayload
    verifyUpdateEmail(email: String!, token: String!): DefaultPayload
    createUser(
      email: String!
      firstName: String!
      lastName: String
      username: String!
      password: String
      passwordRepeat: String
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
    resetPassword(password: String!, token: String!): User
    passwordChange(oldPassword: String!, newPassword: String!): DefaultPayload
    updateUserNotificationSetting(settings: SettingsInput!): NotificationSetting
    updateUserSocialLink(socialLink: SocialLinkInput!): User
    addUserCustomLink(newLink: CustomLinkInput!): User
    updateUserCustomLink(link: LinkInput!): User
    deleteUserCustomLink(link: LinkInput!): User
    updateUserTitle(title: String!): User
    setPrimaryExpertise(expertiseId: String!): UserExpertise
    setSecondaryExpertise(expertiseId: String!): UserExpertise
    deletePaymentMethod(id: String!, force: Boolean): DefaultPayload
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

  input LinkInput {
    linkId: String!
    type: String!
    url: String!
  }

  input SettingsInput {
    pushNotifications: Boolean!
    upVote: Boolean!
    downVote: Boolean!
    repliesAndQuotes: Boolean!
    bookmarks: Boolean!
    columns: Boolean!
    invitations: Boolean!
    yourReputation: Boolean!
    reminders: Boolean!
    admin: Boolean!
  }

  type NotificationSetting {
    id: ID!
    pushNotifications: Boolean!
    upVote: Boolean!
    downVote: Boolean!
    repliesAndQuotes: Boolean!
    bookmarks: Boolean!
    columns: Boolean!
    invitations: Boolean!
    yourReputation: Boolean!
    reminders: Boolean!
    admin: Boolean!
    createdAt: String!
    updatedAt: String!
    UserId: ID!
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

  type UserPaymentMethods {
    list: [UserPaymentMethod]
    count: Int!
  }

  type UserPaymentMethod {
    id: String
    name: String
    brend: String
    brand: String
    expire_year: Int
    last_digits: String
    expire_month: Int
  }

  type SocialLink {
    twitter: String
    facebook: String
    linkedin: String
    instagram: String
  }

  input SocialLinkInput {
    twitter: String
    facebook: String
    linkedin: String
    instagram: String
  }

  type CustomLink {
    linkId: String!
    type: String!
    url: String!
  }

  input CustomLinkInput {
    type: String!
    url: String!
  }

  type User {
    id: String
    email: String!
    lookupId: String
    fullName: String
    firstName: String
    lastName: String
    username: String
    profilePicture: String
    profileDescription: String
    isAnonymousUser: Boolean
    pseudoUser: Boolean
    notificationsSeenAt: DateTime
    settings: JSON
    expertises(limit: Int, page: Int): [Expertise]
    interests(limit: Int, page: Int): [Interest]
    invitedBy: [User]
    userExpertises: [UserExpertise]
    paymentMethod: UserPaymentMethod
    notificationSetting: NotificationSetting
    title: String
    socialLink: SocialLink
    customLink: [CustomLink]
  }
`

module.exports = userSchema
