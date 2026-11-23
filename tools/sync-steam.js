'use strict';

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.join(projectRoot, 'source', 'steam-games.json');

const apiKey = (process.env.STEAM_API_KEY || '').trim();
const steamId = (process.env.STEAM_ID || '').trim();

function writeFallbackIfMissing() {
  if (fs.existsSync(outputPath)) return;
  fs.writeFileSync(
    outputPath,
    JSON.stringify({
      configured: false,
      generatedAt: null,
      gameCount: 0,
      totalHours: 0,
      recentHours: 0,
      recentGames: [],
      topGames: [],
    }, null, 2) + '\n',
    'utf8'
  );
}

function headerImageUrl(appid) {
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
}

function roundHours(minutes) {
  return Math.round((Number(minutes || 0) / 60) * 10) / 10;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'zhangchenxu.uk Steam Sync' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  if (!apiKey || !steamId) {
    console.log('[sync:steam] STEAM_API_KEY or STEAM_ID not configured; skipping.');
    writeFallbackIfMissing();
    return;
  }

  const ownedUrl =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${encodeURIComponent(apiKey)}` +
    `&steamid=${encodeURIComponent(steamId)}&include_appinfo=true&include_played_free_games=true&format=json`;
  const recentUrl =
    `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${encodeURIComponent(apiKey)}` +
    `&steamid=${encodeURIComponent(steamId)}&count=6&format=json`;

  const [ownedData, recentData] = await Promise.all([
    fetchJson(ownedUrl),
    fetchJson(recentUrl).catch(() => ({ response: { games: [] } })),
  ]);

  const ownedGames = ownedData?.response?.games || [];
  const totalMinutes = ownedGames.reduce((sum, g) => sum + Number(g.playtime_forever || 0), 0);

  const topGames = [...ownedGames]
    .filter(g => Number(g.playtime_forever || 0) > 0)
    .sort((a, b) => Number(b.playtime_forever || 0) - Number(a.playtime_forever || 0))
    .slice(0, 12)
    .map(g => ({
      appid: Number(g.appid),
      name: String(g.name || `App ${g.appid}`),
      hoursForever: roundHours(g.playtime_forever),
      hours2Weeks: roundHours(g.playtime_2weeks || 0),
      headerUrl: headerImageUrl(g.appid),
    }));

  const recentRaw = recentData?.response?.games || [];
  const recentMinutes = recentRaw.reduce((sum, g) => sum + Number(g.playtime_2weeks || 0), 0);
  const recentGames = recentRaw.slice(0, 6).map(g => ({
    appid: Number(g.appid),
    name: String(g.name || `App ${g.appid}`),
    hours2Weeks: roundHours(g.playtime_2weeks || 0),
    hoursForever: roundHours(g.playtime_forever || 0),
    headerUrl: headerImageUrl(g.appid),
  }));

  // Privacy-safe payload: never includes SteamID, profile URL, or persona name
  const payload = {
    configured: true,
    generatedAt: new Date().toISOString(),
    gameCount: Number(ownedData?.response?.game_count || ownedGames.length),
    totalHours: roundHours(totalMinutes),
    recentHours: roundHours(recentMinutes),
    recentGames,
    topGames,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`[sync:steam] Synced ${payload.gameCount} games (${payload.totalHours}h total).`);
}

main().catch(err => {
  console.warn('[sync:steam] Failed:', err.message);
  writeFallbackIfMissing();
});
