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

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`\n** Web-Auth-I Challenge API Running on port ${port} **\n`));