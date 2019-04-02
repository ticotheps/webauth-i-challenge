const router = require('express').Router();

const Users = require('./users-model.js');

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