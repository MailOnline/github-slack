'use strict';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function pullRequest2Attachment(pr) {
  const created = new Date(pr.created_at).valueOf();
  const diff = Date.now() - created;

  let color = 'good';

  if (diff > DAY) {
    color = 'warning';
  }

  if (diff > 3 * DAY) {
    color = 'danger';
  }

  return {
    color,
    'fallback': `<${pr.html_url}|${pr.title}> created by <${pr.user.html_url}|${pr.user.login}>`,
    'author_name': pr.user.login,
    'author_link': pr.user.url,
    'author_icon': pr.user.avatar_url,

    'title': pr._repo.name,
    'title_link': pr._repo.html_url,

    'thumb_url': `http://${pr._repo.owner.login}.github.io/${pr._repo.name}/logo.png`,
    'text': `<${pr.html_url}|${pr.title}>\n` + pr.body.replace('BREAKING CHANGE', '*BREAKING CHANGE*'),
    'ts': Math.floor(created / 1000),
    'mrkdwn_in': ['pretext', 'text']
  };
}

module.exports = {
  pullRequest2Attachment
};
