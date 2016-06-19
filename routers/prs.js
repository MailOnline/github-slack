'use strict';

const express = require('express');
const request = require('request');
const github = require('../modules/github');
const slack = require('../modules/slack');

const router = express.Router();

function validateRequest(req) {
  // TODO: implement
  return true;
}

const responseTypeMap = {
  show: 'in_channel',
  list: 'ephemeral'
};

function parseCommand(text = '') {
  let [ action, team ] = text
    .trim()
    .split(' ')
    .filter(command => !!command.length);

  const responseType = responseTypeMap[action];

  return {
    valid: !!team && !!responseType,
    team,
    responseType
  };
}

function retrieveAndNotify(req, res, command) {
  const responseUrl = req.body.response_url;

  github.getTeamPullRequests(command.team)
    .then((prs) => {
      const text = prs.length ? `*${command.team} repositories pull requests *` : '*No pull request at the moment*';
      const attachments = prs.map(slack.pullRequest2Attachment);
      const response = {
        text,
        attachments,
        response_type: command.responseType,
      };

      request.post({
        uri: responseUrl,
        method: 'POST',
        json: response
      });
    })
    .catch((error) => {
      console.error(error);
    });

  res.send({
    response_type: command.responseType,
    text: `Retrieving ${command.team} pull requests...`
  });
}

function commandHelp(req, res, command) {
  res.send({
    response_type: command.responseType || 'ephemeral',
    text: `/prs list [team] - \n/prs show [team] - `
  });
}


router.use('/', function (req, res) {
  console.log('Received request for /prs', req.body);

  if(validateRequest()) {
    const command = parseCommand(req.body.text);
    if (command.valid) {
      retrieveAndNotify(req, res, command);
    } else {
      commandHelp(req, res, command);
    }

  } else {
    res.sendStatus(403);
  }
});


module.exports = router;
