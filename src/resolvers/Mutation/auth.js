const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const mail = require('../../mail');
const {
  ResetPasswordsMatch,
  ResetTokenExpired,
  ResetTokenNotFound,
  UserNotFound,
  InvalidPassword,
  InvalidEmail,
} = require('../../errors');
const helmet = require('../helmet');

async function signup(parent, { input }, ctx, info) {
  const { email, name, password, confirmPassword } = input;

  if (!validator.isEmail(email)) {
    throw new InvalidEmail({ data: { email } });
  }

  if (password.length < 6) {
    throw new PasswordTooShort();
  }

  if (!validator.equals(password, confirmPassword)) {
    throw new PasswordsNoMatch();
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await ctx.db.mutation.createUser({
    data: { name, email, password: hash, role: 'Teacher' },
  });

  return {
    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    user,
  };
}

async function login(parent, { input }, ctx, info) {
  const { email, password } = input;
  const user = await ctx.db.query.user({ where: { email } });
  if (!user) {
    throw new UserNotFound({ data: { email } });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new InvalidPassword();
  }

  return {
    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    user,
  };
}

async function recover(parent, { input }, { db, request }, info) {
  const { email } = input;
  const user = await db.query.user({ where: { email } });
  if (!user) {
    throw new UserNotFound({ data: email });
  }
  const baseUrl = request.get('origin');
  const resetToken = crypto.randomBytes(20).toString('hex') + Date.now();
  const resetExpires = new Date(Date.now() + 360000);
  const resetUrl = `${baseUrl}/reset/${resetToken}`;
  const updatedUser = Object.assign(
    user,
    await db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetExpires },
    })
  );

  await mail.send({
    user: updatedUser,
    subject: 'Password Reset - WatchWord',
    resetUrl,
  });

  return updatedUser;
}

async function reset(parent, { input }, ctx, info) {
  const { resetToken, password } = input;
  const user = await ctx.db.query.user({
    where: { resetToken },
  });
  if (!user) {
    throw new ResetTokenNotFound();
  }

  if (user.resetExpires === null || user.resetExpires > Date.now()) {
    throw new ResetTokenExpired();
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    throw new ResetPasswordsMatch();
  }

  const hash = await bcrypt.hash(password, 10);
  const updatedUser = await ctx.db.mutation.updateUser(
    {
      where: { resetToken },
      data: { password: hash, resetExpires: null },
    },
    info
  );

  return updatedUser;
}

module.exports = {
  login: helmet(login),
  signup: helmet(signup),
  recover: helmet(recover),
  reset: helmet(reset),
};
