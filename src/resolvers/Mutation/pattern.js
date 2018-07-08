const { ifLoggedIn, hasPermission } = require('../../utils');
const helmet = require('../helmet');
const {
  throwError,
  NotAuthorized,
  NotAuthorizedToDelete,
} = require('../../errors');

async function createPattern(_, { input }, ctx, info) {
  return ctx.db.mutation.createPattern({ data: input }, info);
}

async function deletePattern(_, { id }, ctx, info) {
  if (!hasPermission(ctx.request.user, 'Admin')) {
    throwError([NotAuthorizedToDelete('pattern'), {}]);
  }

  return ctx.db.mutation.deletePattern({ where: { id } }, info);
}

async function updatePattern(_, { id, input }, context, info) {
  if (!hasPermission(ctx.request.user, 'Admin')) {
    throwError([NotAuthorized, {}]);
  }

  return ctx.db.mutation.updatePattern(
    {
      where: { id },
      data: input,
    },
    info
  );
}

module.exports = {
  createPattern: helmet(ifLoggedIn(createPattern)),
  deletePattern: helmet(ifLoggedIn(deletePattern)),
  updatePattern: helmet(ifLoggedIn(updatePattern)),
};
