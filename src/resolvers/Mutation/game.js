const { getUserId } = require('../../utils');
const helmet = require('../helmet');

async function createGame(_, { input }, context, info) {
  const { pattern, games } = input;
  const userId = getUserId(context);
  const gameIds = games.map(id => ({ id }));
  const newGame = await context.db.mutation.createGame(
    {
      data: {
        owner: { connect: { id: userId } },
        pattern: { connect: { pattern } },
        games: { connect: gameIds },
      },
    },
    info
  );
  return newGame;
}

module.exports = {
  createGame: helmet(createGame),
};
