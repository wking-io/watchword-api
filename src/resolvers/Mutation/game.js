const { ifLoggedIn, hasPermission } = require('../../utils');
const helmet = require('../helmet');
const { throwError } = require('../../errors');

async function createGame(_, { input }, ctx, info) {
  const { pattern, words, ...args } = input;
  return ctx.db.mutation.createGame(
    {
      data: {
        owner: {
          connect: {
            id: ctx.request.userId,
          },
        },
        pattern: {
          connect: {
            pattern,
          },
        },
        words: {
          connect: words.map(word => ({ word })),
        },
        ...args,
      },
    },
    info
  );
}

async function deleteGame(_, { id }, ctx, info) {
  const where = { id };
  const game = await ctx.db.query.game({ where }, `{ owner { id } }`);

  if (
    game.owner.id !== ctx.request.userId ||
    !hasPermission(ctx.request.user, ['Admin'])
  ) {
    throwError([NotAuthorizedToDelete('game'), {}]);
  }

  return ctx.db.mutation.deleteGame({ where }, info);
}

async function updateGame(_, { id, input }, context, info) {
  const { pattern, words, ...args } = input;
  const where = { id };
  const game = await ctx.db.query.game({ where }, `owner { id }`);

  if (
    game.owner.id !== ctx.request.userId ||
    !hasPermission(ctx.request.user, ['Admin'])
  ) {
    throwError([NotAuthorized, {}]);
  }

  return ctx.db.mutation.updateGame({
    data: {
      pattern: {
        connect: {
          pattern,
        },
      },
      words: {
        connect: {
          word: words.map(word => ({ word })),
        },
      },
      ...args,
    },
  });
}

module.exports = {
  createGame: helmet(ifLoggedIn(createGame)),
  deleteGame: helmet(ifLoggedIn(deleteGame)),
  updateGame: helmet(ifLoggedIn(updateGame)),
};
