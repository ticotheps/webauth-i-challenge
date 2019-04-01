const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());


server.get('/', (req, res) => {
    res.send("Yay! My server is working!");
});

// allows a user to add a username and hashed password to the database
server.post('/api/register', (req, res) => {
    let user = req.body;

    /// hash the password
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


server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            // check the password guess against the database
            if (user && bcrypt.compareSync(password, user.password)) {
                res.status(200).json({ messsage: `Welcome ${user.username}!` });
            } else {
                res.status(401).json({ message: 'Invalid Credentials' });
            }           
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

// restrticts access to the '/api/login' endpoint to only users 
// that provide the right credentials in the heaaders
server.get('/api/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

// middleware that 
function restricted(req, res, next) {
    const { username, password } = req.headers;

    if (username && password) {
        Users.findBy({ username })
            .first()
            .then(user => {
                // check the password against the database
                if (user && bcrypt.compareSync(password, user.password)) {
                    next();
                } else {
                    res.status(401).json({ message: 'Invalid Credentials' });
                }
            })
            .catch(error => {
                res.status(500).json({ message: 'Ran into an unexpected error' });
            })
        next();
    } else {
        res.status(401).json({ message: 'No credentials provided' });
    }; 
}


const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`\n** Web-Auth-I Challenge API Running on port ${port} **\n`));