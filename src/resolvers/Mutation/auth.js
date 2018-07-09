const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const R = require('ramda');
const mail = require('../../mail');
const {
  ResetTokenNotFound,
  InvalidPassword,
  throwError,
} = require('../../errors');
const helmet = require('../helmet');
const { validate, sanitizeEmail, findUser, hash } = require('../../utils');

async function login(parent, { input }, ctx, info) {
  const user = await findUser(ctx.db.query.user, { email: input.email });
  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    throwError([InvalidPassword, {}]);
  }

  return { user, token: jwt.sign({ userId: user.id }, process.env.APP_SECRET) };
}

async function recover(parent, { input }, ctx, info) {
  const user = await findUser(ctx.db.query.user, { email: input.email });
  const resetToken = crypto.randomBytes(20).toString('hex') + Date.now();
  const resetExpires = new Date(Date.now() + 360000);

  const result = await ctx.db.mutation.updateUser({
    where: { email: input.email },
    data: { resetToken, resetExpires },
  });

  const mailResult = await mail.send({
    user,
    subject: 'Password Reset - WatchWord',
    message: `You can reset your password here: <a href="${
      process.env.FRONTEND_URL
    }/reset/${resetToken}">Reset Password</a>`,
  });

  return result;
}

async function reset(parent, { resetToken, input }, ctx, info) {
  const password = await R.compose(
    hash,
    validate.passwordConfirm,
    validate.passwordLength
  )(input);

  const [user] = await ctx.db.query.users({
    where: {
      resetToken,
      resetExpires_gte: new Date(Date.now() - 3600000), // within the last hour
    },
  });

  if (!user) {
    throwError([ResetTokenNotFound, {}]);
  }

  const updatedUser = await ctx.db.mutation.updateUser({
    where: { email: user.email },
    data: {
      password,
      resetExpires: null,
      resetToken: null,
    },
  });

  return {
    updatedUser,
    token: jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET),
  };
}

async function signup(parent, { input }, ctx, info) {
  const password = await R.compose(
    hash,
    validate.passwordConfirm,
    validate.passwordLength,
    validate.email,
    sanitizeEmail
  )(input);

  const user = await ctx.db.mutation.createUser({
    data: {
      name: input.name,
      email: input.email,
      password,
      role: 'Teacher',
    },
  });

  return { user, token: jwt.sign({ userId: user.id }, process.env.APP_SECRET) };
}

module.exports = {
  login: helmet(login),
  recover: helmet(recover),
  reset: helmet(reset),
  signup: helmet(signup),
};
