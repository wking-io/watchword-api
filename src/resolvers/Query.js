const { forwardTo } = require('prisma-binding');
const { hasPermission, ifLoggedIn } = require('../utils');
const { throwError, NotAuthorized } = require('../errors');
const helmet = require('./helmet');

async function games(parent, args, ctx, info) {
  return ctx.db.query.games(
    { where: { owner: { id: ctx.request.userId } } },
    info
  );
}
async function game(parent, { id }, ctx, info) {
  const [game] = await ctx.db.query.games(
    { where: { id, owner: { id: ctx.request.userId } } },
    info
  );
  return game;
}

async function me(parent, args, ctx, info) {
  return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
}

const patterns = forwardTo('db');
async function pattern(parent, { pattern }, ctx, info) {
  return ctx.db.query.pattern({ where: { pattern } }, info);
}

async function sessions(parent, args, ctx, info) {
  return ctx.db.query.sessions(
    { where: { game: { owner: { id: ctx.request.userId } } } },
    info
  );
}

async function session(parent, { id }, ctx, info) {
  const [session] = await ctx.db.query.sessions(
    { where: { id, game: { owner: { id: ctx.request.userId } } } },
    info
  );
  return session;
}

async function users(parent, args, ctx, info) {
  if (!hasPermission(ctx.request.user, 'Admin')) {
    throwError([NotAuthorized, {}]);
  }

  return ctx.db.query.users({}, info);
}

async function user(parent, { id }, ctx, info) {
  if (!hasPermission(ctx.request.user, 'Admin')) {
    throwError([NotAuthorized, {}]);
  }

  return ctx.db.query.users({ where: { id } }, info);
}

const words = forwardTo('db');
async function word(parent, { id }, ctx, info) {
  return ctx.db.query.word({ where: { id } }, info);
}

const Query = {
  games: helmet(ifLoggedIn(games)),
  game: helmet(game),
  me: helmet(ifLoggedIn(me)),
  patterns: helmet(ifLoggedIn(patterns)),
  pattern: helmet(ifLoggedIn(pattern)),
  sessions: helmet(ifLoggedIn(sessions)),
  session: helmet(ifLoggedIn(session)),
  users: helmet(ifLoggedIn(users)),
  user: helmet(ifLoggedIn(user)),
  words: helmet(ifLoggedIn(words)),
  word: helmet(ifLoggedIn(word)),
};

module.exports = { Query };
