const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

const sessionConfig = {
    name: 'doodie',
    secret: 'yankee doodle went to town',
    cookie: {
        maxAge: 1000 * 60 * 30, // equals 30 minutes
        secure: false,
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));


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
        .then(savedUser => {
            res.status(201).json(savedUser);
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
                res.status(200).json({ messsage: `Welcome ${user.username}!` });
            } else {
                res.status(401).json({ message: 'You shall not pass!' });
            }           
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

// this middleware only allows for specific users to have access to the list of 'users' in the db
function only(username) {
    return function(req, res, next) {
      if (req.headers.username === username) {
        next();
      } else {
        res.status(403).json({ message: `You don't have access because you are not ${username}!` });
      }
    };
}

//-----------NEW MIDDLEWARE; after addition of express-sessions--------------
function restricted(req, res, next) {

    if (req.session && req.session.username) {
      next();
    } else {
      res.status(401).json({ message: 'You shall not pass!' });
    }
  }

// ----------OLD MIDDLEWARE; before addition of express-sessions-------------
// middleware that checks the credentials of the user (in the headers of the GET request) 
// before allowing access to the list of 'users'
// function restricted(req, res, next) {
//     const { username, password } = req.headers;

//     if (username && password) {
//         Users.findBy({ username })
//             .first()
//             .then(user => {
//                 // check the password against the database
//                 if (user && bcrypt.compareSync(password, user.password)) {
//                     next();
//                 } else {
//                     res.status(401).json({ message: 'Invalid Credentials' });
//                 }
//             })
//             .catch(error => {
//                 res.status(500).json({ message: 'You shall not pass!' });
//             });
//     } else {
//         res.status(400).json({ message: 'No credentials provided' });
//     }; 
// }

// allows a user to gain access to the list of 'users' in the db
server.get('/api/users', restricted, only('tico'), (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(error => {
            res.send(error);
        });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`\n** Web-Auth-I Challenge API Running on port ${port} **\n`));