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

function getRecentAnime(limit = 4) {
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
  const heatmapDays = allDays.slice(-140);
  return {
    totalContributions: Number(data.totalContributions || 0),
    username: data.username || 'zhangchengxuv',
    profileUrl: data.profileUrl || 'https://github.com/zhangchengxuv',
    avatarUrl: data.avatarUrl || 'https://github.com/zhangchengxuv.png',
    heatmapDays,
  };
}

function readSteamStats() {
  const data = readJson(path.join(hexo.source_dir, 'steam-games.json'), {});
  return {
    configured: Boolean(data.configured),
    generatedAt: data.generatedAt || null,
    gameCount: Number(data.gameCount || 0),
    totalHours: Number(data.totalHours || 0),
    recentHours: Number(data.recentHours || 0),
    recentGames: Array.isArray(data.recentGames) ? data.recentGames : [],
    topGames: Array.isArray(data.topGames) ? data.topGames : [],
  };
}

function readMusicStats() {
  const data = readJson(path.join(hexo.source_dir, 'qq-music.json'), {});
  return {
    configured: Boolean(data.configured),
    playlistName: data.playlistName || '我的歌单',
    songCount: Number(data.songCount || 0),
    tracks: Array.isArray(data.tracks) ? data.tracks : [],
  };
}

function readPhotos() {
  const root = String(hexo.config.root || '/').replace(/\/?$/, '/');
  const metaList = readJson(path.join(hexo.source_dir, '_data', 'photos.json'), []);
  const photosDir = path.join(hexo.source_dir, 'photos');
  const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

  const metaByFile = new Map();
  const ordered = [];
  const addedSrc = new Set();

  const normalizeSrc = src => {
    if (!src) return '';
    if (/^https?:\/\//i.test(src)) return src;
    const clean = String(src).replace(/^\/+/, '');
    return clean.startsWith('photos/') ? `${root}${clean}` : `${root}photos/${clean}`;
  };

  if (Array.isArray(metaList)) {
    metaList.forEach(item => {
      if (!item?.src) return;
      const src = normalizeSrc(item.src);
      const fileKey = path.basename(String(item.src)).toLowerCase();
      metaByFile.set(fileKey, item);
      if (!addedSrc.has(src)) {
        addedSrc.add(src);
        ordered.push({
          src,
          title: item.title || path.parse(fileKey).name,
          category: item.category || '摄影',
          location: item.location || '',
          camera: item.camera || '',
          date: item.date || '',
        });
      }
    });
  }

  if (fs.existsSync(photosDir)) {
    const files = fs.readdirSync(photosDir)
      .filter(name => imageExts.has(path.extname(name).toLowerCase()))
      .sort((a, b) => b.localeCompare(a, 'zh-CN'));

    files.forEach(file => {
      if (metaByFile.has(file.toLowerCase())) return;
      const src = `${root}photos/${encodeURIComponent(file)}`;
      if (addedSrc.has(src)) return;
      addedSrc.add(src);
      ordered.push({
        src,
        title: path.parse(file).name.replace(/[-_]+/g, ' '),
        category: '摄影',
        location: '',
        camera: '',
        date: '',
      });
    });
  }

  return ordered;
}

hexo.extend.helper.register('site_stats', function () {
  const github = readGithubStats();
  return {
    anime: countUnique('bangumis.json'),
    books: countUnique('books.json'),
    games: countUnique('games.json'),
    posts: this.site?.posts?.length || 0,
    recentAnime: getRecentAnime(8),
    githubTotal: github.totalContributions,
    githubUsername: github.username,
    githubUrl: github.profileUrl,
    githubAvatar: github.avatarUrl,
    heatmapDays: github.heatmapDays,
    steam: readSteamStats(),
    music: readMusicStats(),
    photos: readPhotos(),
  };
});
