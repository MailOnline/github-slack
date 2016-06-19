'use strict';

const express = require('express');
const request = require('request');
const config = require('../modules/config');
const github = require('../modules/github');
const slack = require('../modules/slack');

const router = express.Router();

function validateMessage() {
  // TODO: implement
  return true;
}

const responseTypeMap = {
  show: 'in_channel',
  help: 'ephemeral',
  list: 'ephemeral',
  default: 'ephemeral'
};

function parseCommand(message) {

  let [ action, team ] = message.text
    .trim()
    .split(' ')
    .filter(command => !!command.length);
  const responseType = responseTypeMap[action];
  const command = {
    message,
    action,
    team,
    responseType
  };

  if (!responseType) {
    return Promise.reject(new Error('Invalid action specified'));
  } else if (action === 'default' || action === 'help' || !!team) {
    return Promise.resolve(command);
  } else {
    return config.get(`${message.team_domain}/${message.user_id}/team`)
      .then((userTeam) => (command.team = userTeam, command));
  }
}

function retrieveAndNotify(req, res, command) {
  const responseUrl = req.body.response_url;

  github.getTeamPullRequests(command.team)
    .then((prs) => {
      const text = prs.length ? `*${command.team} repositories pull requests *` : '*No pull request at the moment*';
      const attachments = prs.map(slack.pullRequest2Attachment);

      return {
        text,
        attachments,
        response_type: command.responseType,
      };
    })
    .catch((error) => {
      console.error(error);
      return {
        response_type: command.responseType,
        text: `Error occured while retriving your team Pull Requests.\n${error.message}`
      };
    })
    .then((response) => {
      request.post({
        uri: responseUrl,
        method: 'POST',
        json: response
      });
    });

  res.send({
    response_type: command.responseType,
    text: `Retrieving ${command.team} pull requests...`
  });
}

function setUserTeam(req, res, command) {
  const responseUrl = req.body.response_url;
  config.set(`${command.message.team_domain}/${command.message.user_id}/team`, command.team)
    .then(() => {
      return {
        response_type: command.responseType,
        text: 'Default team successfully saved.'
      };
    })
    .catch((error) => {
      console.error(error);
      return {
        response_type: command.responseType,
        text: `Error occured while saving.\n${error.message}`
      };
    })
    .then((response) => {
      request.post({
        uri: responseUrl,
        method: 'POST',
        json: response
      });
    });

  res.send({
    response_type: command.responseType,
    text: 'Saving your default team...'
  });
}

function getUserTeam(req, res, command) {
  const responseUrl = req.body.response_url;
  config.get(`${command.message.team_domain}/${command.message.user_id}/team`)
    .then((userTeam) => {
      return {
        response_type: command.responseType,
        text: `Your default team is '${userTeam}'`
      };
    })
    .catch((error) => {
      console.error(error);
      return {
        response_type: command.responseType,
        text: `Error occured while retrieving your configs.\n${error.message}`
      };
    })
    .then((response) => {
      request.post({
        uri: responseUrl,
        method: 'POST',
        json: response
      });
    });

  res.send({
    response_type: command.responseType,
    text: 'Retrieving your default team...'
  });
}

function commandHelp(req, res) {
  res.send({
    response_type: 'ephemeral',
    text: [
      '• `/prs help` Shows this help message',
      '• `/prs default` Show your default team',
      '• `/prs default [team]` Sets your default team so that it can be omitted in the other commands',
      '• `/prs list [team]` Lists the github PRs of the `team` silently',
      '• `/prs show [team]` Shares the github PRs of the `team` with the channel',
      'NOTE: if no team is specified the default will be used'
      ].join('\n')
  });
}


router.use('/', function (req, res) {
  const message = req.body;
  console.log('Received request for /prs', message);

  if(validateMessage(message)) {
    parseCommand(message)
      .then(command => {
        switch(command.action) {
          case 'show':
          case 'list':
            retrieveAndNotify(req, res, command);
            break;
          case 'help':
            commandHelp(req, res);
            break;
          case 'default':
            if(command.team) {
              setUserTeam(req, res, command);
            } else {
              getUserTeam(req, res, command);
            }
            break;
        }
      })
      .catch((error) => {
        res.send({
          response_type: 'ephemeral',
          text: `Error while parsing your command.\n${error.message}`
        });
      });
  } else {
    res.sendStatus(403);
  }
});


module.exports = router;
