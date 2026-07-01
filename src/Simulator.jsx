import { useState, useMemo } from 'react';
import { TEAMS, GK, R32_SRC } from './data.js';

// ─── Bracket ───────────────────────────────────────────────────────────────
// idx 0-15  → Rodada de 32 (16 jogos)
// idx 16-23 → Oitavas       win[2i] vs win[2i+1]
// idx 24-27 → Quartas       win[16+2i] vs win[16+2i+1]
// idx 28-29 → Semifinais    win[24]×win[25] / win[26]×win[27]
// idx 30    → 3º Lugar      lose[28] × lose[29]
// idx 31    → Final         win[28]  × win[29]

const SIM_ROUNDS = [
  { id:'r32', label:'Rodada de 32', indices: Array.from({length:16},(_,i)=>i)   },
  { id:'r16', label:'Oitavas',      indices: Array.from({length:8},(_,i)=>i+16) },
  { id:'qf',  label:'Quartas',      indices: Array.from({length:4},(_,i)=>i+24) },
  { id:'sf',  label:'Semifinais',   indices: [28, 29]                           },
  { id:'fn',  label:'Final',        indices: [31, 30]                           },
];

// Converte src do R32_SRC para team id usando classificação atual do grupo
function resolveSlot(src, allS) {
  if (!src || src.lbl) return null;
  const s = allS[src.g];
  return s && s[src.p] ? s[src.p].id : null;
}

// Retorna [home, away] para qualquer posição do bracket
// r32Map: { [teamId]: opponentId } — mapa dos confrontos reais da API
function getTeams(idx, picks, allS, r32Map) {
  if (idx < 16) {
    const [s0, s1] = R32_SRC[idx];
    const t0 = resolveSlot(s0, allS);
    // Slot de 3º colocado: busca oponente real na API (r32Map) ou "A definir"
    if (s0.lbl || s1.lbl) {
      const t1 = t0 ? (r32Map[t0] ?? null) : null;
      return [t0, t1];
    }
    return [t0, resolveSlot(s1, allS)];
  }
  if (idx < 24) { const b=(idx-16)*2;    return [getWinner(b,picks,allS,r32Map),   getWinner(b+1,picks,allS,r32Map)]; }
  if (idx < 28) { const b=(idx-24)*2+16; return [getWinner(b,picks,allS,r32Map),   getWinner(b+1,picks,allS,r32Map)]; }
  if (idx===28) return [getWinner(24,picks,allS,r32Map), getWinner(25,picks,allS,r32Map)];
  if (idx===29) return [getWinner(26,picks,allS,r32Map), getWinner(27,picks,allS,r32Map)];
  if (idx===30) return [getLoser(28,picks,allS,r32Map),  getLoser(29,picks,allS,r32Map)];
  if (idx===31) return [getWinner(28,picks,allS,r32Map), getWinner(29,picks,allS,r32Map)];
  return [null, null];
}

function getWinner(idx, picks, allS, r32Map) {
  const [h, a] = getTeams(idx, picks, allS, r32Map);
  const p = picks[idx];
  if (!p) return null;
  return p === 'h' ? h : a;
}

function getLoser(idx, picks, allS, r32Map) {
  const [h, a] = getTeams(idx, picks, allS, r32Map);
  const p = picks[idx];
  if (!p) return null;
  return p === 'h' ? a : h;
}

// ─── Flag ──────────────────────────────────────────────────────────────────
function Flag({ code }) {
  if (!code) return <span style={{width:24,height:16,display:'inline-block',background:'#0e1f38',borderRadius:3}}/>;
  return <span className={`fi fi-${code}`} style={{fontSize:'1.4em',lineHeight:1,flexShrink:0}}/>;
}

// ─── Slot clicável ─────────────────────────────────────────────────────────
function Slot({ teamId, side, isWinner, isLoser, onClick }) {
  const td = teamId ? TEAMS[teamId] : null;
  return (
    <div
      className={`sim-slot${isWinner?' sim-win':isLoser?' sim-lose':td?' sim-pick':' nd'}`}
      onClick={() => td && onClick(side)}
    >
      <Flag code={td?.f}/>
      <span className={`sim-name${!td?' sim-tbd':''}`}>{td ? td.n : 'A definir'}</span>
      {isWinner && <span className="sim-tick">✓</span>}
    </div>
  );
}

// ─── Card de jogo ───────────────────────────────────────────────────────────
function MatchCard({ idx, picks, allS, r32Map, label, onPick }) {
  const [h, a] = getTeams(idx, picks, allS, r32Map);
  const winner  = getWinner(idx, picks, allS, r32Map);

  const handlePick = (side) => {
    const team = side==='h' ? h : a;
    if (!team) return;
    onPick(idx, picks[idx]===side ? null : side);
  };

  return (
    <div className={`sim-card${idx===31?' sim-final-card':idx===30?' sim-third-card':''}`}>
      <div className="sim-card-hdr">
        <span>{label}</span>
        {winner && <span className="sim-decided">✓</span>}
      </div>
      <Slot teamId={h} side="h"
        isWinner={!!(winner && winner===h)}
        isLoser={!!(winner && winner!==h && h)}
        onClick={handlePick}/>
      <div className="sim-vs">×</div>
      <Slot teamId={a} side="a"
        isWinner={!!(winner && winner===a)}
        isLoser={!!(winner && winner!==a && a)}
        onClick={handlePick}/>
    </div>
  );
}

// ─── Barra de progresso ─────────────────────────────────────────────────────
function ProgressBar({ picks, allS, r32Map }) {
  const champ = getWinner(31, picks, allS, r32Map);
  const rounds = SIM_ROUNDS.map(r => ({
    label: r.label,
    done: r.indices.filter(i => picks[i]).length,
    total: r.indices.length,
  }));
  return (
    <div className="sim-progress">
      {rounds.map(r => (
        <div key={r.label} className="sim-prog-item">
          <div className="sim-prog-bar">
            <div className="sim-prog-fill" style={{width:`${(r.done/r.total)*100}%`}}/>
          </div>
          <span className="sim-prog-lbl">{r.label} {r.done}/{r.total}</span>
        </div>
      ))}
      {champ && (
        <div className="sim-prog-champ">
          🏆 <Flag code={TEAMS[champ]?.f}/> <b>{TEAMS[champ]?.n}</b>
        </div>
      )}
    </div>
  );
}

// ─── SIMULADOR PRINCIPAL ────────────────────────────────────────────────────
export default function Simulator({ allS, koApi }) {
  const [picks, setPicks] = useState({});
  const [round, setRound] = useState('r32');

  // Mapa: teamId → oponenteId nos jogos reais da Rodada de 32
  // Fonte: API (football-data.org) via koApi — resolve os confrontos dos melhores 3ºs
  // que seguem as regras FIFA de 495 cenários (impossível calcular localmente)
  const r32Map = useMemo(() => {
    const map = {};
    (koApi || [])
      .filter(m => m.stage === 'LAST_32' && m.h && m.a)
      .forEach(m => {
        map[m.h] = m.a;
        map[m.a] = m.h;
      });
    return map;
  }, [koApi]);

  // Limpa cascata de picks dependentes
  const clearDownstream = (idx, next) => {
    const deps = idx < 16  ? [16 + Math.floor(idx/2)]
               : idx < 24  ? [24 + Math.floor((idx-16)/2)]
               : idx < 28  ? [28 + Math.floor((idx-24)/2)]
               : (idx===28||idx===29) ? [30, 31]
               : [];
    deps.forEach(d => { next[d] = null; clearDownstream(d, next); });
  };

  const onPick = (idx, side) => {
    setPicks(prev => {
      const next = { ...prev };
      if (!side) {
        next[idx] = null;
        clearDownstream(idx, next);
      } else {
        if (prev[idx] && prev[idx] !== side) clearDownstream(idx, next);
        next[idx] = side;
      }
      return next;
    });
  };

  const reset = () => setPicks({});

  const champ    = getWinner(31, picks, allS, r32Map);
  const terceiro = getWinner(30, picks, allS, r32Map);
  const totalPicks = Object.values(picks).filter(Boolean).length;
  const currentRound = SIM_ROUNDS.find(r => r.id === round);

  return (
    <div className="sim-wrap">

      <div className="sim-head">
        <div>
          <div className="sim-title">🎯 Simulador de Mata-Mata</div>
          <div className="sim-subtitle">
            Clique no time vencedor · confrontos baseados no chaveamento oficial FIFA
          </div>
        </div>
        <button className="sim-reset" onClick={reset}>↺ Resetar</button>
      </div>

      <ProgressBar picks={picks} allS={allS} r32Map={r32Map}/>

      {champ && (
        <div className="sim-champ-banner">
          <span className="sim-champ-trophy">🏆</span>
          <div>
            <div className="sim-champ-lbl">Seu Campeão Simulado</div>
            <div className="sim-champ-name">
              <Flag code={TEAMS[champ]?.f}/>
              <span>{TEAMS[champ]?.n}</span>
            </div>
          </div>
          {terceiro && (
            <div className="sim-third-info">
              🥉 3º: <Flag code={TEAMS[terceiro]?.f}/> {TEAMS[terceiro]?.n}
            </div>
          )}
        </div>
      )}

      <div className="sim-rounds">
        {SIM_ROUNDS.map(r => {
          const done = r.indices.filter(i => picks[i]).length;
          return (
            <button key={r.id}
              className={`sim-round-btn${round===r.id?' on':''}`}
              onClick={() => setRound(r.id)}>
              {r.label}
              <span className="sim-round-count">{done}/{r.indices.length}</span>
            </button>
          );
        })}
      </div>

      <div className={`sim-grid${round==='fn'?' sim-grid-final':''}`}>
        {currentRound.indices.map((idx, i) => {
          const lbl = idx===31 ? '🏆 FINAL'
                    : idx===30 ? '🥉 3º LUGAR'
                    : `Jogo ${i+1}`;
          return (
            <MatchCard key={idx} idx={idx} picks={picks}
              allS={allS} r32Map={r32Map} label={lbl} onPick={onPick}/>
          );
        })}
      </div>

      <div className="hint">
        💡 {totalPicks}/31 jogos definidos
        {totalPicks > 0 && <> · <button className="sim-link" onClick={reset}>Limpar tudo</button></>}
      </div>
    </div>
  );
}
