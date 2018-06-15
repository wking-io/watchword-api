const { getUserId } = require('../../utils');
const helmet = require('../helmet');

function createWord(_, { input }, context, info) {
  const userId = getUserId(context);
  return context.db.mutation.createWord(
    {
      data: input,
    },
    info
  );
}

module.exports = {
  createWord: helmet(createWord),
};
