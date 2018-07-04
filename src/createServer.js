const { GraphQLServer } = require('graphql-yoga');
const db = require('./db');
const resolvers = require('./resolvers');

function createServer() {
  return new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers,
    context: req => ({ ...req, db }),
  });
}

module.exports = createServer;
