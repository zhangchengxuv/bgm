'use strict';

const fs = require('node:fs');
const path = require('node:path');

function readJson(fullPath, fallback) {
  if (!fs.existsSync(fullPath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function countUnique(file) {
  const data = readJson(path.join(hexo.source_dir, '_data', file), {});
  const ids = new Set();
  ['wantWatch', 'watching', 'watched'].forEach(group => {
    (data[group] || []).forEach(item => {
      if (item?.id != null) ids.add(String(item.id));
    });
  });
  return ids.size;
}

function getRecentAnime(limit = 3) {
  const data = readJson(path.join(hexo.source_dir, '_data', 'bangumis.json'), {});
  const manifest = readJson(path.join(hexo.source_dir, 'covers', 'manifest.json'), { covers: {} });
  const root = String(hexo.config.root || '/').replace(/\/?$/, '/');
  const picked = [];
  const seen = new Set();

  const addGroup = (items, status) => {
    for (const item of items || []) {
      if (picked.length >= limit) break;
      const id = String(item?.id || '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const cached = manifest.covers?.[`anime:${id}`]?.path;
      const cover = cached
        ? `${root}${String(cached).replace(/^\//, '')}`
        : String(item.coverOriginal || item.cover || '').replace(/^http:/, 'https:');
      picked.push({
        id,
        title: item.title || '',
        score: item.score || '—',
        type: item.type || '动画',
        status,
        cover,
      });
    }
  };

  addGroup(data.watching, '在看');
  addGroup(data.watched, '看过');
  addGroup(data.wantWatch, '想看');
  return picked;
}

function readGithubStats() {
  const data = readJson(path.join(hexo.source_dir, 'github-activity.json'), {});
  const allDays = [];
  (data.weeks || []).forEach(week => {
    (week.contributionDays || []).forEach(day => {
      const count = Number(day.contributionCount || 0);
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      allDays.push({ date: day.date || '', count, level });
    });
  });
  const heatmapDays = allDays.slice(-98);
  return {
    totalContributions: Number(data.totalContributions || 0),
    username: data.username || 'zhangchengxuv',
    profileUrl: data.profileUrl || 'https://github.com/zhangchengxuv',
    avatarUrl: data.avatarUrl || 'https://github.com/zhangchengxuv.png',
    heatmapDays,
  };
}

hexo.extend.helper.register('site_stats', function () {
  const github = readGithubStats();
  return {
    anime: countUnique('bangumis.json'),
    books: countUnique('books.json'),
    games: countUnique('games.json'),
    posts: this.site?.posts?.length || 0,
    recentAnime: getRecentAnime(3),
    githubTotal: github.totalContributions,
    githubUsername: github.username,
    githubUrl: github.profileUrl,
    githubAvatar: github.avatarUrl,
    heatmapDays: github.heatmapDays,
  };
});
