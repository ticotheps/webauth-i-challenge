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
            // HERE is where we can PERSIST the session data for the user
            req.session.username = saved;

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
router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ message: "You can checkout if you'd like, but you can never leave!"});
            } else {
                res.status(200).json({ message: "Goodbye! Thanks for playing!"});
            }
        })
    } else {
        res.status(200).json({ message: "Goodbye! Thanks for playing!" });
    }
});

module.exports = router;