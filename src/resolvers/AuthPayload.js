const helmet = require('./helmet');

async function user({ user: { id } }, args, ctx, info) {
  return ctx.db.query.user({ where: { id } }, info);
}

module.exports = {
  user: helmet(user),
};
