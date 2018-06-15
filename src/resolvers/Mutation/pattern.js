const { getUserId, awaitMap } = require('../../utils');
const helmet = require('../helmet');
const { throwError } = require('../../errors');

async function createPattern(_, { input }, context, info) {
  return getUserId(context)
    .map(awaitMap(context.db.mutation.createPattern, { data: input }, info))
    .leftMap(throwError)
    .get();
}

async function deletePattern(_, { id }, context, info) {
  return getUserId(context)
    .map(awaitMap(context.db.mutation.deletePattern, { data: input }, info))
    .leftMap(throwError)
    .get();
}

async function updatePattern(_, { id, input }, context, info) {
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.updatePattern,
        { where: { id }, data: input },
        info
      )
    )
    .leftMap(throwError)
    .get();
}

module.exports = {
  createPattern: helmet(createPattern),
  deletePattern: helmet(deletePattern),
  updatePattern: helmet(updatePattern),
};
