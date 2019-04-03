const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Step 1: Install and import 'jsonwebtoken'

const Users = require('../users/users-model.js');

// Step 4: Define an env variable called 'secret' for the parameter returned
// in the 'generateToken()' function.
const secret = 'add a third table for many to many relationships';

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

// Step 3: Build a 'generateToken(user)' function.
function generateToken(user) {
    const payload = {
      subject: user.id, // sub in payload is what the token is about
      username: user.username,
      // ... any other data that we might want to add to the token here
    };
  
    const options = {
      expiresIn: '1d',
    }
  
    return jwt.sign(payload, secret, options);
  };

// checks a user's credentials against the credentials in the database
// before giving the user access to '/api/login' endpoint
router.post('/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            // check the password guess against the database
            if (user && bcrypt.compareSync(password, user.password)) {
                // Step 2a: GENERATE A TOKEN HERE.
                const token = generateToken(user);

                res.status(200).json({
                    message: `Welcome ${user.username}!, have a token...`,
                    token, // Step 2b: RETURN A TOKEN HERE.
                  });
            } else {
                res.status(401).json({ message: 'You shall not pass!' });
            }           
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

module.exports = router;