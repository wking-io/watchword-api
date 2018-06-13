const { getUserId } = require('../../utils');
const helmet = require('../helmet');

function createWord(_, args, context, info) {
  const userId = getUserId(context);
  return context.db.mutation.createWord(
    {
      data: args,
    },
    info
  );
}

module.exports = {
  createWord: helmet(createWord),
};
