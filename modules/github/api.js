'use strict';

const GitHubApi = require('github');

const InMemoryCache = require('../../helpers/InMemoryCache');
const requestCache = new InMemoryCache({
  name: 'requestCache',
  ttl: 10000
});

const githubApi = new GitHubApi({
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  timeout: 5000,
  headers: {
    'user-agent': 'github-slack-ua'
  },
  followRedirects: false // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
});

githubApi.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_TOKEN
});

function getAllPages(method, options) {
  options.per_page = 100;

  return new Promise((resolve, reject) => {
    githubApi.getAllPages(method, options, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function requestOrganisationTeams(organisation) {
  const valueKey = `teams-${organisation}`;
  return requestCache.get(valueKey)
    .catch(() => {
      const teamsRequest = getAllPages(githubApi.orgs.getTeams, {
        org: organisation
      });
      return requestCache.set(valueKey, teamsRequest);
    });
}

function requestTeamRepos(teamId) {
  const valueKey = `repos-${teamId}`;
  return requestCache.get(valueKey)
    .catch(() => {
      const teamsRequest = getAllPages(githubApi.orgs.getTeamRepos, {
        id: teamId
      });
      return requestCache.set(valueKey, teamsRequest);
    });
}

function requestRepoPullRequests(organisation, repoName) {
  const valueKey = `pullRequests-${organisation}-${repoName}`;
  return requestCache.get(valueKey)
    .catch(() => {
      const teamsRequest = getAllPages(githubApi.pullRequests.getAll, {
        user: organisation,
        repo: repoName
      });
      return requestCache.set(valueKey, teamsRequest);
    });
}

module.exports = {
  githubApi,
  requestOrganisationTeams,
  requestTeamRepos,
  requestRepoPullRequests
};
