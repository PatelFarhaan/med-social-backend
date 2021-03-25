const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')
const { GraphQLUpload } = require('graphql-upload')

module.exports = {
  JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  Upload: GraphQLUpload
}
