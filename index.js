const server = require('./api/server.js');

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`\n** Web-Auth-I Challenge API Running on port ${port} **\n`));