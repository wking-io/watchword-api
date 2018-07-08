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
  NotLoggedIn,
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

const fromNullable = R.curry((err, f, x) => {
  const result = f(x);
  if (R.isNil(result)) {
    throwError(err);
  }
  return result;
});

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

function getToken(req) {
  return (req.get('Authorization') || '').replace('Bearer ', '');
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.APP_SECRET);
  } catch (err) {
    throwError(JwtFailedToVerify(err.name, err.message));
  }
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
    if (!ctx.request.userId) throwError([NotLoggedIn, {}]);

    return fn(parent, args, ctx, info);
  };
}

function hasPermission({ role }, needed) {
  return role === needed;
}

function log(x) {
  console.log(`Check it -> ${x}`);
  return x;
}

module.exports = {
  getToken,
  verifyToken,
  validate,
  sanitizeEmail,
  hash,
  checkPassword,
  findUser,
  fromNullable,
  safeProp,
  ifLoggedIn,
  hasPermission,
  log,
};
