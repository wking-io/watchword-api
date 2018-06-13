const { getUserId } = require('../../utils');
const helmet = require('../helmet');

async function createGame(_, { name, description, slug }, context, info) {
  const userId = getUserId(context);
  const newGame = await context.db.mutation.createGame(
    {
      data: {
        name,
        description,
        slug,
      },
    },
    info
  );
  return newGame;
}

module.exports = {
  createGame: helmet(createGame),
};
