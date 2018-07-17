const { compose, curry, equals, prepend, reject, take } = require('ramda');
const { shuffle } = require('./utils');

const parts = {
  Group: ['ad', 'ag', 'am', 'an', 'ap', 'ar', 'at', 'ay', 'ash', 'ed', 'eg'],

  Beginning: [
    'b',
    'c',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'm',
    'n',
    'p',
    'r',
    's',
    't',
    'v',
    'w',
    'y',
    'z',
  ],

  Ending: ['b', 'd', 'g', 'm', 'n', 'p', 'r', 's', 't', 'w', 'x', 'y', 'sh'],
  Vowel: ['a', 'e', 'i', 'o', 'u', 'y'],
};

const get = curry((parts, focus, size, base) => {
  if (focus === 'Vowel') {
    return parts[focus];
  }
  return compose(
    shuffle,
    prepend(base),
    take(size - 1),
    shuffle,
    reject(equals(base))
  )(parts[focus]);
});

module.exports = get(parts);
