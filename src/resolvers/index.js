const { Query } = require('./Query');
const auth = require('./Mutation/auth');
const exercise = require('./Mutation/exercise');
const game = require('./Mutation/game');
const word = require('./Mutation/word');
const AuthPayload = require('./AuthPayload');

module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...exercise,
    ...game,
    ...word,
  },
  AuthPayload,
};
