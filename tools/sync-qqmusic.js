'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.join(projectRoot, 'source', 'qq-music.json');
const playlistId = (process.env.QQ_MUSIC_PLAYLIST_ID || '2821337163').trim();

function writeFallbackIfMissing() {
  if (fs.existsSync(outputPath)) return;
  fs.writeFileSync(
    outputPath,
    JSON.stringify({
      configured: false,
      generatedAt: null,
      songCount: 0,
      tracks: [],
    }, null, 2) + '\n',
    'utf8'
  );
}

function albumCoverUrl(albummid) {
  if (!albummid) return '';
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albummid}.jpg`;
}

async function main() {
  const url =
    `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg` +
    `?type=1&json=1&utf8=1&onlysong=0&disstid=${encodeURIComponent(playlistId)}&format=json`;

  const res = await fetch(url, {
    headers: {
      Referer: 'https://y.qq.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const cd = data?.cdlist?.[0];
  if (!cd || !Array.isArray(cd.songlist)) throw new Error('Unexpected QQ Music response');

  // Privacy-safe payload: only song metadata, never creator QQ/UIN/nickname
  const tracks = cd.songlist
    .filter(s => s?.songname)
    .slice(0, 18)
    .map(s => ({
      name: String(s.songname).trim(),
      singer: Array.isArray(s.singer) ? s.singer.map(x => x.name).filter(Boolean).join(' / ') : '',
      album: String(s.albumname || '').trim(),
      cover: albumCoverUrl(s.albummid),
      url: s.songmid ? `https://y.qq.com/n/ryqq/songDetail/${s.songmid}` : 'https://y.qq.com/',
    }));

  const payload = {
    configured: true,
    generatedAt: new Date().toISOString(),
    playlistName: String(cd.dissname || '我的歌单'),
    songCount: Number(cd.songnum || cd.songlist.length),
    tracks,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`[sync:music] Synced ${payload.songCount} songs (saved top ${tracks.length}).`);
}

main().catch(err => {
  console.warn('[sync:music] Failed:', err.message);
  writeFallbackIfMissing();
});
