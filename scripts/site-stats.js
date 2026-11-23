'use strict';

const fs = require('node:fs');
const path = require('node:path');

function countUnique(file) {
  const fullPath = path.join(hexo.source_dir, '_data', file);
  if (!fs.existsSync(fullPath)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const ids = new Set();
    ['wantWatch', 'watching', 'watched'].forEach(group => {
      (data[group] || []).forEach(item => {
        if (item?.id != null) ids.add(String(item.id));
      });
    });
    return ids.size;
  } catch (_) {
    return 0;
  }
}

function readGithubStats() {
  const fullPath = path.join(hexo.source_dir, 'github-activity.json');
  if (!fs.existsSync(fullPath)) return { totalContributions: 0, username: 'zhangchengxuv' };
  try {
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return {
      totalContributions: Number(data.totalContributions || 0),
      username: data.username || 'zhangchengxuv',
      profileUrl: data.profileUrl || 'https://github.com/zhangchengxuv',
    };
  } catch (_) {
    return { totalContributions: 0, username: 'zhangchengxuv', profileUrl: 'https://github.com/zhangchengxuv' };
  }
}

hexo.extend.helper.register('site_stats', function () {
  const github = readGithubStats();
  return {
    anime: countUnique('bangumis.json'),
    books: countUnique('books.json'),
    games: countUnique('games.json'),
    posts: this.site?.posts?.length || 0,
    githubTotal: github.totalContributions,
    githubUsername: github.username,
    githubUrl: github.profileUrl,
  };
});
