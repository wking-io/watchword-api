const { forwardTo } = require('prisma-binding');
const { hasPermission, ifLoggedIn } = require('../utils');
const helmet = require('./helmet');

const words = forwardTo('db');
const patterns = forwardTo('db');

async function games(parent, args, ctx, info) {
  return ctx.db.query.games(
    { where: { owner: { id: ctx.request.userId } } },
    info
  );
}

async function sessions(parent, args, ctx, info) {
  return ctx.db.query.sessions(
    { where: { game: { owner: { id: ctx.request.userId } } } },
    info
  );
}

const Query = {
  words: helmet(ifLoggedIn(words)),
  patterns: helmet(ifLoggedIn(patterns)),
  games: helmet(ifLoggedIn(games)),
  sessions: helmet(ifLoggedIn(sessions)),
};

module.exports = { Query };
