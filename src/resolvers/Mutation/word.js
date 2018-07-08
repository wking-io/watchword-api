const { ifLoggedIn } = require('../../utils');
const helmet = require('../helmet');
const { throwError, NotAuthorizedToDelete } = require('../../errors');

async function createWord(parent, { input }, ctx, info) {
  return ctx.db.mutation.createWord({ data: input }, info);
}

async function deleteWord(parent, { id }, ctx, info) {
  if (!hasPermission(ctx.request.user, 'Admin')) {
    throwError([NotAuthorizedToDelete('word'), {}]);
  }

  return ctx.db.mutation.deleteWord({ where: { id } }, info);
}

async function updateWord(parent, { id, input }, ctx, info) {
  if (!hasPermission(ctx.request.user, 'Admin')) {
    throwError([NotAuthorized, {}]);
  }

  return ctx.db.mutation.updateWord(
    {
      where: { id },
      data: input,
    },
    info
  );
}

module.exports = {
  createWord: helmet(ifLoggedIn(createWord)),
  deleteWord: helmet(ifLoggedIn(deleteWord)),
  updateWord: helmet(ifLoggedIn(updateWord)),
};
