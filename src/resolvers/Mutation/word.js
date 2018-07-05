const { ifLoggedIn } = require('../../utils');
const helmet = require('../helmet');
const { throwError, NotAuthorizedToDelete } = require('../../errors');

async function createWord(parent, { input }, ctx, info) {
  return ctx.db.mutation.createWord({ data: input }, info);
}

async function deleteWord(parent, { id }, ctx, info) {
  const where = { id };
  const item = await ctx.db.query.item(
    { where },
    `{ user { id }, title, id, description }`
  );

  if (item.user.id !== ctx.request.user.id && !hasPermission(user, ['Admin'])) {
    throwError([NotAuthorizedToDelete('word'), {}]);
  }

  return ctx.db.mutation.deleteWord({ where }, info);
}

async function updateWord(parent, { id, input }, ctx, info) {
  const where = { id };
  const user = ctx.request.user;
  const item = await ctx.db.query.item({ where }, `{ user { id } }`);

  if (item.user.id !== user.id || !hasPermission(user, ['Admin'])) {
    throwError([NotAuthorized, {}]);
  }

  return ctx.db.mutation.updateWord(
    {
      where,
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
