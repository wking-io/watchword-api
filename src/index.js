const { formatError } = require('apollo-errors');
const createServer = require('./createServer');
const db = require('./db');
const { getToken, verifyToken, safeProp, findUser } = require('./utils');

const server = createServer();

server.express.use((req, res, next) => {
  const token = getToken(req);
  if (token) {
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
  port: parseInt(process.env.PORT, 10) || 8000,
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
