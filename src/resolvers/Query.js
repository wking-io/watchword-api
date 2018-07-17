const { forwardTo } = require('prisma-binding');
const {
  compose,
  eqProps,
  groupWith,
  length,
  prop,
  reduce,
  splitEvery,
  sortBy,
  toLower,
} = require('ramda');
const { hasPermission, ifLoggedIn } = require('../utils');
const { throwError, NotAuthorized } = require('../errors');
const helmet = require('./helmet');

// QUERY HELPERS

const shuffle = arr => arr.sort(() => 0.5 - Math.random());

const toPairs = key =>
  compose(
    splitEvery(2),
    sortBy(prop(key))
  );

const splitPairs = ([A, B], [a, b]) => [[...A, a], [...B, b]];

function buildConnect(game) {
  const [left, right] = compose(
    reduce(splitPairs, [[], []]),
    toPairs(toLower(game.focus))
  )(game.words);

  return {
    ...game,
    pattern: game.pattern.pattern,
    left: shuffle(left),
    right: shuffle(right),
  };
}

const isolate = key =>
  compose(
    sortBy(length),
    groupWith(eqProps(key)),
    sortBy(prop(key))
  );

function buildFilter(game) {
  const [[answer], rest] = isolate(toLower(game.focus))(game.words);
  return { ...game, pattern: game.pattern.pattern, answer, rest };
}

function buildIdentify(game) {
  return { ...game, pattern: game.pattern.pattern };
}

function buildMemorize(game) {
  const memorizeData = shuffle([...game.words, ...game.words]);
  return { ...game, pattern: game.pattern.pattern, memorizeData };
}

function buildOrder(game) {
  const orderData = shuffle(game.words);
  return { ...game, pattern: game.pattern.pattern, orderData };
}

// QUERY RESOLVERS

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

async function play(parent, { id }, ctx, info) {
  const [game] = await ctx.db.query.games(
    { where: { id, owner: { id: ctx.request.userId } } },
    `{ id, name, focus, size, pattern { pattern }, words { id, word, group, beginning, ending, vowel } }`
  );

  if (game.pattern.pattern === 'Connect') {
    return buildConnect(game);
  } else if (game.pattern.pattern === 'Filter') {
    return buildFilter(game);
  } else if (game.pattern.pattern === 'Identify') {
    return buildIdentify(game);
  } else if (game.pattern.pattern === 'Memorize') {
    return buildMemorize(game);
  } else if (game.pattern.pattern === 'Order') {
    return buildOrder(game);
  }

  return null;
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
  patterns: helmet(patterns),
  pattern: helmet(pattern),
  play: helmet(play),
  sessions: helmet(ifLoggedIn(sessions)),
  session: helmet(ifLoggedIn(session)),
  users: helmet(ifLoggedIn(users)),
  user: helmet(ifLoggedIn(user)),
  words: helmet(words),
  word: helmet(word),
};

module.exports = { Query };
