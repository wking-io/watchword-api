const jwt = require('jsonwebtoken');
const either = require('data.either');
const validator = require('validator');
const {
  InvalidEmail,
  PasswordTooShort,
  PasswordsNoMatch,
  NotAuthorized,
} = require('./errors');

function getUserId({ request }) {
  return either
    .fromNullable(request.get('Authorization'))
    .map(removeBearer)
    .map(verifyToken)
    .map(getId)
    .leftMap(_ => [NotAuthorized, {}]);
}

function removeBearer(auth) {
  return auth.replace('Bearer ', '');
}

function verifyToken(auth) {
  try {
    var token = jwt.verify(auth, process.env.APP_SECRET);
  } catch (e) {
    return either.Left();
  }
  return either.of(token);
}

function getId({ id }) {
  return id;
}

function awaitMap(f, ...args) {
  return async () => {
    const result = await f(...args);
    return result;
  };
}

function validateEmail(input) {
  if (!validator.isEmail(input.email)) {
    either.Left([InvalidEmail, { data: { email: input.email } }]);
  }
  return either.of(input);
}

function validatePasswordLength(input) {
  if (input.password.length < 6) {
    either.Left([PasswordTooShort, {}]);
  }
  return either.of(input);
}

function validateConfirmPassword(input) {
  if (!validator.equals(input.password, input.confirmPassword)) {
    either.Left([PasswordsNoMatch, {}]);
  }
  return either.of(input);
}

async function validateUser(input, user) {
  if (!user) {
    either.Left([UserNotFound, { data: { email } }]);
  }
  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    either.Left([InvalidPassword, {}]);
  }
  return either.of(user);
}

module.exports = {
  getUserId,
  awaitMap,
  validateEmail,
  validatePasswordLength,
  validateConfirmPassword,
  validateUser,
};
