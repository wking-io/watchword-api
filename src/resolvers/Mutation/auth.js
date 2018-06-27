const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const either = require('data.either');
const Future = require('fluture');
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
  validateUser,
} = require('../../utils');

function deleteUser(parent, { input }, context, info) {
  const deleteUser = Future.encaseP(context.db.mutation.deleteUser);
  return getUserId(context).chain(id => deleteUser({ where: { id } }, info));
}

function signup(parent, { input }, context, info) {
  const hash = Future.encaseN2(bcrypt.hash);
  const createUser = Future.encaseP(context.db.mutation.createUser);

  return validateEmail(input)
    .chain(validatePasswordLength)
    .chain(validateConfirmPassword)
    .chain(i => hash(i.password, 10))
    .map(hash => Object.assign(input, { password: hash, role: 'Teacher' }))
    .chain(i => context.db.mutation.createUser({ data: i }))
    .map(user => ({
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    }));
}

function login(parent, { input }, context, info) {
  const getUser = Future.encaseP(context.db.query.user);

  return getUser({
    where: { email: input.email },
  })
    .map(user => [input, user])
    .chain(validateUser)
    .map(user => {
      return {
        token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
        user,
      };
    });
}

function recover(parent, { input }, { db, request }, info) {
  const { email } = input;
  const user = Future.encaseP(db.query.user);
  const updateUser = Future.encaseP(db.mutation.updateUser);

  const baseUrl = request.get('origin');
  const resetToken = crypto.randomBytes(20).toString('hex') + Date.now();
  const resetExpires = new Date(Date.now() + 360000);
  const resetUrl = `${baseUrl}/reset/${resetToken}`;

  return user({ where: { email } })
    .mapRej([UserNotFound, { data: email }])
    .chain(u =>
      updateUser({
        where: { email: u.email },
        data: { resetToken, resetExpires },
      })
    )
    .map(u => {
      mail.send({
        user: u,
        subject: 'Password Reset - WatchWord',
        resetUrl,
      });
      return u;
    });
}

function reset(parent, { input }, context, info) {
  const { resetToken, password } = input;
  const user = Future.encaseP(context.db.query.user);
  const updateUser = Future.encaseP(context.db.mutation.updateUser);
  const compare = Future.encaseN2(bcrypt.compare);
  const hash = Future.encaseN2(bcrypt.hash);

  return user({ where: { resetToken } })
    .mapRej([ResetTokenNotFound, {}])
    .chain(u => {
      if (user.resetExpires === null || user.resetExpires > Date.now()) {
        return Future.reject([ResetTokenExpired, {}]);
      }
      return Future.of(u);
    })
    .chain(u => compare(password, u.password))
    .mapRej([ResetPasswordsMatch, {}])
    .chain(hash(password, 10))
    .chain(hashed =>
      updateUser(
        {
          where: { resetToken },
          data: { password: hashed, resetExpires: null },
        },
        info
      )
    );
}

module.exports = {
  deleteUser: helmet(deleteUser),
  login: helmet(login),
  signup: helmet(signup),
  recover: helmet(recover),
  reset: helmet(reset),
};
