const { getUserId, awaitMap } = require('../../utils');
const helmet = require('../helmet');
const { throwError } = require('../../errors');

async function createGame(_, { input }, context, info) {
  const { pattern, words, ...args } = input;
  const wordIds = words.map(id => ({ id }));
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.createGame,
        {
          data: {
            owner: { connect: { id: userId } },
            pattern: { connect: { pattern } },
            words: { connect: wordIds },
            ...args,
          },
        },
        info
      )
    )
    .leftMap(throwError)
    .get();
}

async function deleteGame(_, { id }, context, info) {
  return getUserId(context)
    .map(awaitMap(context.db.mutation.deleteGame, { where: { id } }, info))
    .leftMap(throwError)
    .get();
}

async function updateGame(_, { id, input }, context, info) {
  const { pattern, words, ...args } = input;
  const wordIds = words.map(id => ({ id }));
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.createGame,
        {
          where: { id },
          data: {
            owner: { connect: { id: userId } },
            pattern: { connect: { pattern } },
            words: { connect: wordIds },
            ...args,
          },
        },
        info
      )
    )
    .leftMap(throwError)
    .get();
}

module.exports = {
  createGame: helmet(createGame),
  deleteGame: helmet(deleteGame),
  updateGame: helmet(updateGame),
};
