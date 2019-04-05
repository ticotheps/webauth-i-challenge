const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
// const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const configuredKnex = require('../database/dbConfig.js');

const server = express();

const sessionConfig = {
    name: 'doodie',
    secret: 'yankee doodle went to town',
    cookie: {
        maxAge: 1000 * 60 * 30, // equals 30 minutes (in milliseconds)
        secure: false, // Use cookie over https? 'false' during development, 'true' during production;
        httpOnly: true, // Can JS access the cookie on the browser?
    },
    resave: false, // avoid recreating unchanged session data
    saveUninitialized: false,
    // "false" = does not force users to accept cookies, follows FDPR compliance
    // "true" = forces user to accept cookies

    store: new KnexSessionStore({
        knex: configuredKnex,
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 60, // deletes expired session every 60 minutes (in ms)
    }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
    res.send("Yay! My server is working!");
});

module.exports = server;