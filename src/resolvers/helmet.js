const { FatalError, throwError } = require('../errors');

const helmet = resolver => async (...args) => {
  try {
    const result = await resolver(...args);
    return result;
  } catch (err) {
    if (err.path) {
      throwError([FatalError, { data: { reason: err.message } }]);
    } else {
      throw err;
    }
  }
};

module.exports = helmet;
