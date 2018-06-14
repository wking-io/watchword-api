const Query = {
  games(_, args, context, info) {
    return context.db.query.games({}, info);
  },

  words(_, args, context, info) {
    return context.db.query.words({}, info);
  },

  pattern(_, { pattern }, context, info) {
    return context.db.query.pattern({ where: { pattern } }, info);
  },
};

module.exports = { Query };
