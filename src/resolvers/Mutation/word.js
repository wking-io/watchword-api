const { getUserId } = require('../../utils');

const word = {
  createWord(_, args, context, info) {
    const userId = getUserId(context);
    return context.db.mutation.createWord(
      {
        data: args,
      },
      info
    );
  },
};

module.exports = { word };
