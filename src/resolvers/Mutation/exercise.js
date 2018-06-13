const { getUserId } = require('../../utils');
const helmet = require('../helmet');

async function createExercise(_, { gameId }, context, info) {
  const userId = getUserId(context);
  const newExercise = await context.db.mutation.createExercise(
    {
      data: {
        owner: { connect: { id: userId } },
        game: { connect: { id: gameId } },
      },
    },
    info
  );
  return newExercise;
}

module.exports = {
  createExercise: helmet(createExercise),
};
