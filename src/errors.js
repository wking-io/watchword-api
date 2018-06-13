const { createError } = require('apollo-errors');

const errors = {
  ResetTokenExpired: createError('ResetTokenExpired', {
    message: 'Your token is expired.',
  }),
  ResetPasswordsMatch: createError('ResetPasswordsMatch', {
    message: 'New password is the same as old password.',
  }),
  ResetTokenNotFound: createError('ResetTokenNotFound', {
    message: 'Reset token not found.',
  }),
  UserNotFound: createError('UserNotFound', {
    message: 'User with that email not found.',
  }),
  InvalidPassword: createError('InvalidPassword', {
    message: 'Password is invalid.',
  }),
  InvalidEmail: createError('InvalidEmail', {
    message: 'Email is not a valid email address.',
  }),
  NotAuthorized: createError('NotAuthorized', {
    message: 'Your account is not authorized to view this content.',
  }),
  FatalError: createError('FatalError', {
    message: 'Fatal error from Prisma API.',
  }),
  PasswordsNoMatch: createError('PasswordsNoMatch', {
    message: 'Your passwords do not match',
  }),
  PasswordTooShort: createError('PasswordTooShort', {
    message: 'Password must be at least 6 characters long',
  }),
};

module.exports = errors;
