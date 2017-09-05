const { makeExecutableSchema } = require('graphql-tools')
const typeDefs = require('./types')
const resolvers = require('./resolvers')

const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = executableSchema
