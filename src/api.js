import { TLA_MAP } from './data.js';

const LIVE = new Set(['LIVE','IN_PLAY','PAUSED','HALFTIME','EXTRA_TIME','PENALTY']);
const KO_STAGES = ['LAST_32','LAST_16','QUARTER_FINALS','SEMI_FINALS','THIRD_PLACE','FINAL'];

function tlaToId(t){ if(!t) return null; return TLA_MAP[t] || TLA_MAP[t.toUpperCase()] || null; }

export async function fetchMatches(currentMatches){
  try{
    const res = await fetch('/api/matches');
    if(res.status === 429) return { groupMatches:null, koMatches:null, error:'rate_limit' };
    if(!res.ok){
      const j = await res.json().catch(()=>({}));
      return { groupMatches:null, koMatches:null, error: j.error || `http_${res.status}` };
    }
    const data = await res.json();
    const updated = { ...currentMatches };
    const ko = [];

    (data.matches || []).forEach(m => {
      const isLive = LIVE.has(m.status);
      const isDone = m.status === 'FINISHED';

      if(m.stage === 'GROUP_STAGE'){
        const g   = (m.group || '').replace(/^GROUP_/, '');
        const hId = tlaToId(m.homeTeam?.tla);
        const aId = tlaToId(m.awayTeam?.tla);
        if(!g || !hId || !aId) return;
        const k  = [hId, aId].sort();
        const k1 = `${g}:${k[0]}-${k[1]}`;
        if(!updated[k1]) return;
        const homeIsHome = updated[k1].h === hId;
        const hs = m.score?.fullTime?.home;
        const as = m.score?.fullTime?.away;
        updated[k1] = {
          ...updated[k1],
          hs: (isDone || isLive) && hs !== null && hs !== undefined ? (homeIsHome ? hs : as) : updated[k1].hs,
          as: (isDone || isLive) && as !== null && as !== undefined ? (homeIsHome ? as : hs) : updated[k1].as,
          status: m.status,
          live: isLive,
          date: m.utcDate || updated[k1].date,
        };
      } else if(KO_STAGES.includes(m.stage)){
        ko.push({
          id: m.id,
          stage: m.stage,
          date: m.utcDate,
          h: tlaToId(m.homeTeam?.tla),
          a: tlaToId(m.awayTeam?.tla),
          hs: (isDone || isLive) ? (m.score?.fullTime?.home ?? null) : null,
          as: (isDone || isLive) ? (m.score?.fullTime?.away ?? null) : null,
          pen: m.score?.penalties || null,
          winner: m.score?.winner || null,
          status: m.status,
          live: isLive,
        });
      }
    });

    ko.sort((a,b) => new Date(a.date) - new Date(b.date));
    return { groupMatches: updated, koMatches: ko, error: null };
  } catch(e){
    return { groupMatches:null, koMatches:null, error: e.message };
  }
}

export const hasApiKey = () => true;
