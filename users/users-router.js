const router = require('express').Router();

const Users = require('./users-model.js');
const restricted = require('../auth/restricted-middleware.js');

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

// allows a user to gain access to the list of 'users' in the db
router.get('/', restricted, only('tico'), (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(error => {
            res.send(error);
        });
});

module.exports = router;