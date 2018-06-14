const { getUserId } = require('../../utils');
const helmet = require('../helmet');

async function createPattern(_, args, context, info) {
  const userId = getUserId(context);
  const newPattern = await context.db.mutation.createPattern(
    {
      data: args,
    },
    info
  );
  return newPattern;
}

module.exports = {
  createPattern: helmet(createPattern),
};
