'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const app = express();

const serverPort = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));

app
  .use('/prs', require('./routers/prs'));

app.listen(serverPort, function() {
  console.log(`github-slack is running on port ${serverPort}`);

  // Prevent dyno sleep
  // by polling every 5 minutes (300000)
  setInterval(() => https.get(process.env.HEROKU_URL), 300000);

});