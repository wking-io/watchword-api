const { getUserId } = require('../../utils');

const exercise = {
  createExercise(_, { gameId }, context, info) {
    const userId = getUserId(context);
    return context.db.mutation.createExercise(
      {
        data: {
          owner: { connect: { id: userId } },
          game: { connect: { id: gameId } },
        },
      },
      info
    );
  },
};

module.exports = { exercise };
