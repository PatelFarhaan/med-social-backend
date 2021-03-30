const { gql } = require('apollo-server-express')

const typesSchema = gql`
  scalar JSON
  scalar DateTime
  scalar Upload

  type DefaultPayload {
    status: Int
    message: String
  }
`

module.exports = typesSchema
