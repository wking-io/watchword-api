const { getUserId } = require('../../utils');
const helmet = require('../helmet');

async function createPattern(_, { input }, context, info) {
  const userId = getUserId(context);
  const newPattern = await context.db.mutation.createPattern(
    {
      data: input,
    },
    info
  );
  return newPattern;
}

module.exports = {
  createPattern: helmet(createPattern),
};
