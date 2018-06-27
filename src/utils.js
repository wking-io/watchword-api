const jwt = require('jsonwebtoken');
const either = require('data.either');
const Future = require('fluture');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {
  InvalidEmail,
  InvalidPassword,
  PasswordTooShort,
  PasswordsNoMatch,
  NotAuthorized,
} = require('./errors');

function fromNullable(check) {
  if (check === null) {
    return Future.reject('Is null.');
  }

  return Future.of(check);
}
function getUserId({ request }) {
  return fromNullable(request.get('Authorization'))
    .map(removeBearer)
    .chain(verifyToken)
    .map(getId)
    .mapRej(_ => [NotAuthorized, {}]);
}

function removeBearer(auth) {
  return auth.replace('Bearer ', '');
}

function verifyToken(auth) {
  try {
    var token = jwt.verify(auth, process.env.APP_SECRET);
  } catch (e) {
    return Future.reject('Failed parsing JWT.');
  }
  return Future.of(token);
}

function getId({ id }) {
  return id;
}

function validateEmail(input) {
  if (!validator.isEmail(input.email)) {
    return Future.reject([InvalidEmail, { data: { email: input.email } }]);
  }
  return Future.of(input);
}

function validatePasswordLength(input) {
  if (input.password.length < 6) {
    return Future.reject([PasswordTooShort, {}]);
  }
  return Future.of(input);
}

function validateConfirmPassword(input) {
  if (!validator.equals(input.password, input.confirmPassword)) {
    return Future.reject([PasswordsNoMatch, {}]);
  }
  return Future.of(input);
}

function validateUser([input, user]) {
  if (!user) {
    return Future.reject([UserNotFound, { data: { email } }]);
  }

  const compare = Future.encaseN2(bcrypt.compare);
  return compare(input.password, user.password)
    .mapRej(_ => [InvalidPassword, {}])
    .map(_ => user);
}

module.exports = {
  getUserId,
  validateEmail,
  validatePasswordLength,
  validateConfirmPassword,
  validateUser,
};
