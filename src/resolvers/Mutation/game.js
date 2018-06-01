const { getUserId } = require('../../utils');

const game = {
  createGame(_, { name, description, slug }, context, info) {
    const userId = getUserId(context);
    return context.db.mutation.createGame({
      data: {
        name,
        description,
        slug,
      },
    });
  },
};

module.exports = { game };
