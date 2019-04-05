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

module.exports = only;
