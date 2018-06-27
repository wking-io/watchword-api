const { FatalError, throwError } = require('../errors');

const helmet = resolver => async (...args) => {
  const result = resolver(...args)
    .mapRej(throwError)
    .promise();

  try {
    return await result;
  } catch (err) {
    if (err.path) {
      throw new FatalError({ data: { reason: err.message } });
    } else {
      throw err;
    }
  }
};

module.exports = helmet;
