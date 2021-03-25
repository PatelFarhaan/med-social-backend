const { gql } = require('apollo-server-express')

const typesSchema = gql`
  scalar JSON
  scalar DateTime
  scalar Upload
`

module.exports = typesSchema
