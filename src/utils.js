const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const R = require('ramda');
const {
  InvalidEmail,
  InvalidPassword,
  PasswordTooShort,
  PasswordsNoMatch,
  JwtFailedToVerify,
  NotAuthorized,
  NoPropFound,
  throwError,
} = require('./errors');

async function findUser(find, by) {
  const user = await find({ where: by });

  if (!user) {
    throwError([UserNotFound, { data: { id } }]);
  }

  return user;
}

const fromNullable = R.curry((err, f) =>
  R.compose(
    R.ifElse(R.isNil, R.always(throwError(err)), R.identity),
    f
  )
);

const safeProp = R.curry((key, obj) =>
  fromNullable(
    [
      NoPropFound,
      {
        data: {
          propery: key,
          object: obj,
        },
      },
    ],
    R.prop(key),
    obj
  )
);

function verifyToken(token) {
  try {
    token = jwt.verify(token, process.env.APP_SECRET);
  } catch (err) {
    throwError(JwtFailedToVerify(err.name, err.message));
  }

  return token;
}

function sanitizeEmail(input) {
  return Object.assign(input, { email: input.email.toLowerCase() });
}

async function hash(input) {
  const password = await bcrypt.hash(input.password, 10);
  return;
}

const validate = {
  email(input) {
    if (!validator.isEmail(input.email)) {
      throwError([InvalidEmail, { data: { email: input.email } }]);
    }
    return input;
  },

  passwordLength(input) {
    if (input.password.length < 6) {
      throwError([PasswordTooShort, {}]);
    }
    return input;
  },

  passwordConfirm(input) {
    if (!validator.equals(input.password, input.confirmPassword)) {
      throwError([PasswordsNoMatch, {}]);
    }
    return input;
  },
};

async function checkPassword([input, user]) {
  const matches = await bcrypt.compare(input.password, user.password);

  if (!matches) {
    throwError([InvalidPassword, {}]);
  }

  return user;
}

function ifLoggedIn(fn) {
  return function ifLoggedInner(parent, args, ctx, info) {
    if (!ctx.request.userId) throwError([NotAuthorized, {}]);

    return fn(parent, args, ctx, info);
  };
}

function setCookie(ctx, data) {
  const token = jwt.sign(data, process.env.APP_SECRET);
  ctx.response.cookie('token', token, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    http: true,
  });
  return token;
}

function clearCookie(clear, name) {
  clear(name);
  return { message: 'Goodbye!' };
}

module.exports = {
  verifyToken,
  validate,
  sanitizeEmail,
  hash,
  checkPassword,
  findUser,
  fromNullable,
  safeProp,
  ifLoggedIn,
  setCookie,
  clearCookie,
};
