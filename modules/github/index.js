'use strict';

const api = require('./api');

function getRepoPullRequests(repo) {
  if( repo.open_issues_count ) {
    return api.requestRepoPullRequests(process.env.GITHUB_ORGANISATION, repo.name)
      .then((pullRequests) => {
        pullRequests.forEach(pr => (pr._repo = repo, pr));
        return pullRequests;
      });
  } else {
    return [];
  }
}

function getTeamPullRequests(teamName) {
  return api.requestOrganisationTeams(process.env.GITHUB_ORGANISATION)
    .then((teams) => {
      const team = teams.find(team => team.name === teamName);
      if (!team) {
        throw new Error(`Couldn find ${teamName} team in your organisation`);
      }

      return api.requestTeamRepos(team.id);
    })
    .then((teamRepos) => {
      const teamPrs = teamRepos.map(getRepoPullRequests);
      return Promise.all(teamPrs);
    })
    .then((teamPrs) => {
      const prs = teamPrs.reduce((prs, repoPrs) => {
        return prs.concat(repoPrs);
      }, []);

      return prs;
    });
}

module.exports = {
  getTeamPullRequests
};