const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const either = require('data.either');
const mail = require('../../mail');
const {
  ResetPasswordsMatch,
  ResetTokenExpired,
  ResetTokenNotFound,
  UserNotFound,
  InvalidPassword,
  InvalidEmail,
  throwError,
} = require('../../errors');
const helmet = require('../helmet');
const {
  awaitMap,
  validateEmail,
  validatePasswordLength,
  validateConfirmPassword,
} = require('../../utils');

async function deleteUser(parent, { input }, context, info) {
  getUserId(context)
    .map(awaitMap(context.db.mutation.deleteUser, { where: { id } }, info))
    .leftMap(throwError)
    .get();
}

async function signup(parent, { input }, context, info) {
  return either
    .of(input)
    .chain(validateEmail)
    .chain(validatePasswordLength)
    .chain(validateConfirmPassword)
    .map(async input => {
      const hash = await bcrypt.hash(input.password, 10);
      return Object.assign(input, { password: hash, role: 'Teacher' });
    })
    .map(async input => {
      const user = await context.db.mutation.createUser({ data: input });
      return {
        token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
        user,
      };
    });
}

async function login(parent, { input }, context, info) {
  return either
    .of(input)
    .chain(async input => {
      const user = await context.db.query.user({
        where: { email: input.email },
      });
      const result = await validateUser(input, user);
      return result;
    })
    .map(user => ({
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    }))
    .mapLeft(throwError)
    .get();
}

async function recover(parent, { input }, { db, request }, info) {
  const { email } = input;
  const user = await db.query.user({ where: { email } });
  if (!user) {
    throwError(UserNotFoundm, { data: email });
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

async function reset(parent, { input }, context, info) {
  const { resetToken, password } = input;
  const user = await context.db.query.user({
    where: { resetToken },
  });
  if (!user) {
    throwError(ResetTokenNotFound);
  }

  if (user.resetExpires === null || user.resetExpires > Date.now()) {
    throwError(ResetTokenExpired);
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    throwError(ResetPasswordsMatch);
  }

  const hash = await bcrypt.hash(password, 10);
  const updatedUser = await context.db.mutation.updateUser(
    {
      where: { resetToken },
      data: { password: hash, resetExpires: null },
    },
    info
  );

  return updatedUser;
}

module.exports = {
  deleteUser: helmet(deleteUser),
  login: helmet(login),
  signup: helmet(signup),
  recover: helmet(recover),
  reset: helmet(reset),
};
