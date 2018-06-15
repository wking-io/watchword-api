const { getUserId, awaitMap } = require('../../utils');
const helmet = require('../helmet');
const { throwError } = require('../../errors');

async function createSession(_, { input }, context, info) {
  return getUserId(context)
    .map(awaitMap(context.db.mutation.createSession, { data: input }, info))
    .leftMap(throwError)
    .get();
}

async function completeSession(_, { id }, context, info) {
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.updateSession,
        {
          where: { id },
          data: {
            complete: true,
            completedAt: Date.now(),
          },
        },
        info
      )
    )
    .leftMap(throwError)
    .get();
}

async function deleteSession(_, { id }, context, info) {
  return getUserId(context)
    .map(awaitMap(context.db.mutation.deleteSession, { where: { id } }, info))
    .leftMap(throwError)
    .get();
}

async function updateSession(_, { id, input }, context, info) {
  return getUserId(context)
    .map(
      awaitMap(
        context.db.mutation.updateSession,
        {
          where: { id },
          data: input,
        },
        info
      )
    )
    .leftMap(throwError)
    .get();
}

module.exports = {
  createSession: helmet(createSession),
  completeSession: helmet(completeSession),
  deleteSession: helmet(deleteSession),
  updateSession: helmet(updateSession),
};
