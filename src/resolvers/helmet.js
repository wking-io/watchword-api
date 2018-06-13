const { FatalError } = require('../errors');

const helmet = resolver => async (...args) => {
  try {
    return await resolver(...args);
  } catch (err) {
    if (err.path) {
      throw new FatalError({ data: { reason: err.message } });
    } else {
      throw err;
    }
  }
};

module.exports = helmet;
