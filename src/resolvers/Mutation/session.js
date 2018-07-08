const { ifLoggedIn, hasPermission } = require('../../utils');
const helmet = require('../helmet');
const {
  throwError,
  NotAuthorized,
  NotAuthorizedToDelete,
} = require('../../errors');

async function createSession(parent, { input }, ctx, info) {
  return ctx.db.mutation.createSession(
    {
      data: {
        game: {
          connect: {
            id: input.gameId,
          },
        },
        name: input.name,
        complete: false,
      },
    },
    info
  );
}

async function completeSession(parent, { id }, ctx, info) {
  return ctx.db.mutation.updateSession(
    {
      where: { id },
      data: {
        complete: true,
        completedAt: new Date(Date.now()),
      },
    },
    info
  );
}

async function updateSession(parent, { id, input }, ctx, info) {
  const where = { id };
  const session = ctx.db.query.session({ where }, `game { owner { id } }`);

  if (
    session.game.owner.id !== ctx.request.userId ||
    !hasPermission(ctx.request.user, 'Admin')
  ) {
    throwError([NotAuthorized, {}]);
  }

  return context.db.mutation.updateSession(
    {
      where,
      data: input,
    },
    info
  );
}

async function deleteSession(parent, { id }, ctx, info) {
  const where = { id };
  const session = ctx.db.query.session({ where }, `game { owner { id } }`);

  if (
    session.game.owner.id !== ctx.request.userId ||
    !hasPermission(ctx.request.user, 'Admin')
  ) {
    throwError([NotAuthorizedToDelete('session'), {}]);
  }

  return ctx.db.mutation.deleteSession({ where }, info);
}

module.exports = {
  createSession: helmet(createSession),
  completeSession: helmet(completeSession),
  deleteSession: helmet(ifLoggedIn(deleteSession)),
  updateSession: helmet(ifLoggedIn(updateSession)),
};
