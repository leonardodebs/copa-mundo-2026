import { TLA_MAP } from './data.js';

// O frontend chama nossa serverless function /api/matches (mesmo domínio,
// sem CORS). A chave da API fica protegida no servidor.
const LIVE_STATUSES = new Set(['LIVE','IN_PLAY','PAUSED','HALFTIME','EXTRA_TIME','PENALTY']);

function tlaToId(tla) {
  if (!tla) return null;
  return TLA_MAP[tla] || TLA_MAP[tla?.toUpperCase()] || null;
}

function groupLetter(apiGroup) {
  if (!apiGroup) return null;
  return apiGroup.replace(/^GROUP_/,'');
}

export async function fetchMatches(currentMatches) {
  try {
    const res = await fetch('/api/matches');

    if (res.status === 429) return { groupMatches: null, error: 'rate_limit' };
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { groupMatches: null, error: j.error || `http_${res.status}` };
    }

    const data = await res.json();
    const updated = { ...currentMatches };

    (data.matches || []).forEach(m => {
      if (m.stage !== 'GROUP_STAGE') return;

      const g   = groupLetter(m.group);
      const hId = tlaToId(m.homeTeam?.tla);
      const aId = tlaToId(m.awayTeam?.tla);
      if (!g || !hId || !aId) return;

      const score  = m.score;
      const isLive = LIVE_STATUSES.has(m.status);
      const isDone = m.status === 'FINISHED';

      const k1 = `${g}:${[hId,aId].sort()[0]}-${[hId,aId].sort()[1]}`;
      if (!updated[k1]) return;

      const storedHome = updated[k1].h;
      const homeIsHome = storedHome === hId;

      const homeScore = score?.fullTime?.home ?? null;
      const awayScore = score?.fullTime?.away ?? null;

      updated[k1] = {
        ...updated[k1],
        hs: (isDone||isLive) && homeScore !== null ? (homeIsHome ? homeScore : awayScore) : updated[k1].hs,
        as: (isDone||isLive) && awayScore !== null ? (homeIsHome ? awayScore : homeScore) : updated[k1].as,
        status : m.status,
        live   : isLive,
        date   : m.utcDate || updated[k1].date,
        apiId  : m.id,
      };
    });

    return { groupMatches: updated, error: null };
  } catch (e) {
    return { groupMatches: null, error: e.message };
  }
}

// A chave agora vive no servidor; o frontend sempre tenta buscar
export const hasApiKey = () => true;
