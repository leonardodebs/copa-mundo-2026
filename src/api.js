import { TLA_MAP, GROUPS, initGroupMatches } from './data.js';

const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const BASE    = 'https://api.football-data.org/v4';

// Status que indicam jogo ao vivo
const LIVE_STATUSES = new Set(['LIVE','IN_PLAY','PAUSED','HALFTIME','EXTRA_TIME','PENALTY']);

function tlaToId(tla) {
  if (!tla) return null;
  return TLA_MAP[tla] || TLA_MAP[tla?.toUpperCase()] || null;
}

function groupLetter(apiGroup) {
  // "GROUP_A" → "A"
  if (!apiGroup) return null;
  return apiGroup.replace(/^GROUP_/,'');
}

/**
 * Busca todos os jogos da Copa do Mundo 2026.
 * Retorna { groupMatches, error }
 */
export async function fetchMatches(currentMatches) {
  if (!API_KEY) return { groupMatches: null, error: 'no_key' };

  try {
    const res = await fetch(`${BASE}/competitions/WC/matches?season=2026`, {
      headers: { 'X-Auth-Token': API_KEY },
    });

    if (res.status === 429) return { groupMatches: null, error: 'rate_limit' };
    if (!res.ok)            return { groupMatches: null, error: `http_${res.status}` };

    const data = await res.json();
    const updated = { ...currentMatches };

    (data.matches || []).forEach(m => {
      if (m.stage !== 'GROUP_STAGE') return;

      const g   = groupLetter(m.group);
      const hId = tlaToId(m.homeTeam?.tla || m.homeTeam?.shortName);
      const aId = tlaToId(m.awayTeam?.tla || m.awayTeam?.shortName);
      if (!g || !hId || !aId) return;

      const score  = m.score;
      const isLive = LIVE_STATUSES.has(m.status);
      const isDone = m.status === 'FINISHED';

      // Descobrir qual key usamos (h e a podem estar em qualquer ordem)
      const k1 = `${g}:${[hId,aId].sort()[0]}-${[hId,aId].sort()[1]}`;
      if (!updated[k1]) return; // jogo não mapeado

      const storedHome = updated[k1].h;
      const homeIsHome = storedHome === hId;

      updated[k1] = {
        ...updated[k1],
        hs: isDone||isLive ? (homeIsHome ? score?.fullTime?.home ?? score?.currentScore?.home : score?.fullTime?.away ?? score?.currentScore?.away) : null,
        as: isDone||isLive ? (homeIsHome ? score?.fullTime?.away ?? score?.currentScore?.away : score?.fullTime?.home ?? score?.currentScore?.home) : null,
        status : m.status,
        live   : isLive,
        date   : m.utcDate,
        apiId  : m.id,
      };
    });

    return { groupMatches: updated, error: null };
  } catch (e) {
    return { groupMatches: null, error: e.message };
  }
}

export const hasApiKey = () => Boolean(API_KEY);
