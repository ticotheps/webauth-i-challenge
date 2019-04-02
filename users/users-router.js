const router = require('express').Router();

const Users = require('./users-model.js');
const restricted = require('../auth/restricted-middleware.js');
const only = require('../auth/only-middleware.js');

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