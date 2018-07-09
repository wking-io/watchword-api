const { formatError } = require('apollo-errors');
const { ApolloEngine } = require('apollo-engine');
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
  port: parseInt(process.env.PORT, 10) || 8000,
  formatError,
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  },
};

if (process.env.APOLLO_ENGINE_KEY) {
  const engine = new ApolloEngine({
    apiKey: process.env.APOLLO_ENGINE_KEY,
  });

  const httpServer = server.createHttpServer({
    tracing: true,
    cacheControl: true,
  });

  engine.listen(
    {
      httpServer,
      ...options,
    },
    deets =>
      console.log(
        `Server with Apollo Engine is running on http://localhost:${
          options.port
        }`
      )
  );
} else {
  graphQLServer.start(
    {
      port,
    },
    () => console.log(`Server is running on http://localhost:${options.port}`)
  );
}
