const { Query } = require('./Query');
const auth = require('./Mutation/auth');
const pattern = require('./Mutation/pattern');
const game = require('./Mutation/game');
const word = require('./Mutation/word');
const AuthPayload = require('./AuthPayload');

module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...pattern,
    ...game,
    ...word,
  },
  AuthPayload,
};
