const router = require('express').Router();
const bcrypt = require('bcryptjs');

const Users = require('../users/users-model.js');

// allows a user to add a new username and hashed password to the database
router.post('/register', (req, res) => {
    let user = req.body;

    /// hashes the password
    const hash = bcrypt.hashSync(user.password, 8);
    user.password = hash;

    Users.add(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

// checks a user's credentials against the credentials in the database
// before giving the user access to '/api/login' endpoint
router.post('/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            // check the password guess against the database
            if (user && bcrypt.compareSync(password, user.password)) {
                res.status(200).json({ messsage: `Welcome ${user.username}! You have received a cookie!` });
            } else {
                res.status(401).json({ message: 'You shall not pass!' });
            }           
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

module.exports = router;