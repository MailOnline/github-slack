'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const serverPort = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));

app
  .use('/prs', require('./routers/prs'));

app.listen(serverPort, function() {
  console.log(`github-slack is running on port ${serverPort}`);
});