const { getUserId, awaitMap } = require('../../utils');
const helmet = require('../helmet');
const { throwError } = require('../../errors');

async function createWord(_, { input }, context, info) {
  return getUserId(context)
    .map(awaitMap(context.db.mutation.createWord, { data: input }, info))
    .leftMap(throwError)
    .get();
}

async function deleteWord(_, { id }, context, info) {
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.deleteWord,
        {
          where: { id },
        },
        info
      )
    )
    .leftMap(throwError)
    .get();
}

async function updateWord(_, { id, input }, context, info) {
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.updateWord,
        {
          where: { id },
          data: input,
        },
        info
      )
    )
    .mapLeft(throwError)
    .get();
}

module.exports = {
  createWord: helmet(createWord),
  deleteWord: helmet(deleteWord),
  updateWord: helmet(updateWord),
};
