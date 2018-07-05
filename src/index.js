const { formatError } = require('apollo-errors');
const jwt = require('jsonwebtoken');
const createServer = require('./createServer');
const db = require('./db');
const cookieParser = require('cookie-parser');
const R = require('ramda');
const { getToken, verifyToken, safeProp, findUser, log } = require('./utils');

const server = createServer();

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const token = getToken(req);
  if (R.not(R.isEmpty(token))) {
    const user = verifyToken(token);
    req.userId = safeProp('userId', user);
  }
  return next();
});

server.express.use(async (req, res, next) => {
  if (!req.userId) return next();
  const user = await findUser(db.query.user, { id: req.userId });
  req.user = user;
  next();
});

const options = {
  port: 8000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
  formatError,
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  },
};

server.start(options, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`
  )
);
