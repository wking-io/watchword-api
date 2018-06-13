const jwt = require('jsonwebtoken');
const { NotAuthorized } = require('./errors');

function getUserId(ctx) {
  const Authorization = ctx.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    return userId;
  }

  throw new NotAuthorized();
}

module.exports = {
  getUserId,
};
