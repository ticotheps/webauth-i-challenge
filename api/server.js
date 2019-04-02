const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const db = require('../database/dbConfig.js');
const Users = require('../users/users-model.js');

const usersRouter = require('../users/users-router.js');

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
        knex: db,
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
server.use('/api/users', usersRouter);


server.get('/', (req, res) => {
    res.send("Yay! My server is working!");
});

// allows a user to add a username and hashed password to the database
server.post('/api/register', (req, res) => {
    let user = req.body;

    /// hashes the password
    const hash = bcrypt.hashSync(user.password, 8);
    user.password = hash;

    Users.add(user)
        .then(saved => {
            // HERE is where we can PERSIST the session data for the user
            req.session.username = saved;

            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

// checks a user's username and password before allowing passage to '/api/login' endpoint
server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            // check the password guess against the database
            if (user && bcrypt.compareSync(password, user.password)) {
                // HERE is where we want to save cookie data regarding the session
                req.session.username = user.username;

                res.status(200).json({ messsage: `Welcome ${user.username}! You have received a cookie!` });
            } else {
                res.status(401).json({ message: 'You shall not pass!' });
            }           
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

// allows the user to log out of the current session
server.get('/api/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            if (error) {
                res.send("You can checkout if you'd like, but you can never leave!");
            } else {
                res.send("Goodbye! Thanks for playing!");
            }
        });
    } else {
        res.end();
    };
});

module.exports = server;