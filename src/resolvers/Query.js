const Query = {
  games(_, args, context, info) {
    return context.db.query.games({}, info);
  },

  words(_, args, context, info) {
    return context.db.query.words({}, info);
  },
};

module.exports = { Query };
