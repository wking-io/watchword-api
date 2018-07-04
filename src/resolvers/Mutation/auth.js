const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const R = require('ramda');
const mail = require('../../mail');
const {
  ResetPasswordsMatch,
  ResetTokenExpired,
  ResetTokenNotFound,
  InvalidPassword,
  NotAuthorizedToDelete,
  throwError,
} = require('../../errors');
const helmet = require('../helmet');
const {
  validate,
  sanitizeEmail,
  setCookie,
  clearCookie,
  findUser,
} = require('../../utils');

async function signup(parent, args, ctx, info) {
  const input = await R.compose(
    hash,
    validate.passwordConfirm,
    validate.passwordLength,
    validate.email,
    sanitizeEmail
  )(args.input);

  const user = await ctx.db.mutation.createUser(
    {
      data: {
        ...input,
        role: 'Teacher',
      },
    },
    info
  );

  return setCookie(ctx.response.cookie, { userId: user.id });
}

async function signout(parent, args, ctx, info) {
  return clearCookie('token');
}

async function login(parent, { input }, ctx, info) {
  const user = await findUser(ctx.db.query.user, { email: input.email });
  const valid = await bcrypt.compare(input.password, user.password);

  if (!valid) {
    throwError([InvalidPassword, {}]);
  }

  return { user, token: setCookie(ctx, { userId: user.id }) };
}

async function recover(parent, { input }, ctx, info) {
  const user = await findUser(ctx.db.query.users, { email: input.email });

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

async function reset(parent, args, ctx, info) {
  const input = await R.compose(
    hash,
    validate.passwordConfirm,
    validate.passwordLength
  )(args.input);

  const [user] = await ctx.db.query.users({
    where: {
      resetToken: args.input.resetToken,
      resetExpires_gte: Date.now() - 3600000, // within the last hour
    },
  });

  if (!user) {
    throwError([ResetTokenNotFound, {}]);
  }

  const updatedUser = await ctx.db.mutation.updateUser({
    where: { email: user.email },
    data: {
      ...input,
      resetExpires: null,
    },
  });

  return setCookie(ctx, { userId: updateUser.id });
}

module.exports = {
  login: helmet(login),
  signup: helmet(signup),
  signout: helmet(signout),
  recover: helmet(recover),
  reset: helmet(reset),
};
