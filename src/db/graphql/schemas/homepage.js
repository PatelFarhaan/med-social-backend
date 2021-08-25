const { gql } = require('apollo-server-express')

const homepageSchema = gql`
  type Query {
    getHomepage(id: ID): Homepage
  }

  type Mutation {
    updateHomepage(
      taglineMain: String
      taglineUnderAsset: String
      tag1: String
      tag2: String
      tag3: String
      tag4: String
      tag5: String
      tag6: String
      headlineMain: String
      headline1: String
      headline2: String
      headline3: String
      headline4: String
      headline5: String
      content1: String
      content2: String
      content3: String
      content4: String
    ): Homepage
  }

  type Homepage {
    id: ID
    taglineMain: String
    taglineUnderAsset: String
    tag1: String
    tag2: String
    tag3: String
    tag4: String
    tag5: String
    tag6: String
    headlineMain: String
    headline1: String
    headline2: String
    headline3: String
    headline4: String
    headline5: String
    content1: String
    content2: String
    content3: String
    content4: String
    createdAt: DateTime
    updatedAt: DateTime
  }
`

module.exports = homepageSchema
