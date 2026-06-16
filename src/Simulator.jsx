import { useState } from 'react';
import { TEAMS, R32_SRC } from './data.js';

// ─── Bracket: 32 matches ───────────────────────────────────────────────────
// 0-15  → Rodada de 32
// 16-23 → Oitavas      (win[2i]   vs win[2i+1])
// 24-27 → Quartas      (win[16+2i] vs win[16+2i+1])
// 28-29 → Semifinais   (win[24] vs win[25], win[26] vs win[27])
// 30    → 3º Lugar     (lose[28] vs lose[29])
// 31    → Final        (win[28] vs win[29])

const SIM_ROUNDS = [
  { id:'r32', label:'Rodada de 32', indices: Array.from({length:16},(_,i)=>i)      },
  { id:'r16', label:'Oitavas',      indices: Array.from({length:8},(_,i)=>i+16)    },
  { id:'qf',  label:'Quartas',      indices: Array.from({length:4},(_,i)=>i+24)    },
  { id:'sf',  label:'Semifinais',   indices: [28, 29]                              },
  { id:'fn',  label:'Final',        indices: [31, 30]                              },
];

// Resolve a vaga de um slot — SEMPRE usa a classificação atual (sem esperar grupo terminar)
// Isso torna o simulador interativo desde o 1º jogo da copa
function resolveSlot(src, allS) {
  if (!src) return null;
  if (src.lbl) return null;                     // vagas de 3º colocados → TBD
  if (src.g !== undefined) {
    const s = allS[src.g];
    if (!s || !s[src.p]) return null;
    return s[src.p].id;                         // sempre retorna o time atual no ranking
  }
  return null;
}

// Retorna [home, away] para qualquer posição do bracket
function getTeams(idx, picks, allS) {
  if (idx < 16) {
    const [s0, s1] = R32_SRC[idx];
    return [resolveSlot(s0, allS), resolveSlot(s1, allS)];
  }
  if (idx < 24) { const b=(idx-16)*2;    return [getWinner(b,picks,allS),   getWinner(b+1,picks,allS)];   }
  if (idx < 28) { const b=(idx-24)*2+16; return [getWinner(b,picks,allS),   getWinner(b+1,picks,allS)];   }
  if (idx===28)  return [getWinner(24,picks,allS), getWinner(25,picks,allS)];
  if (idx===29)  return [getWinner(26,picks,allS), getWinner(27,picks,allS)];
  if (idx===30)  return [getLoser(28,picks,allS),  getLoser(29,picks,allS)];   // 3º lugar
  if (idx===31)  return [getWinner(28,picks,allS), getWinner(29,picks,allS)];  // Final
  return [null, null];
}

function getWinner(idx, picks, allS) {
  const [h, a] = getTeams(idx, picks, allS);
  const p = picks[idx];
  if (!p) return null;
  return p === 'h' ? h : a;
}

function getLoser(idx, picks, allS) {
  const [h, a] = getTeams(idx, picks, allS);
  const p = picks[idx];
  if (!p) return null;
  return p === 'h' ? a : h;
}

// ─── Componente de bandeira ─────────────────────────────────────────────────
function Flag({ code }) {
  if (!code) return <span style={{width:24,height:16,display:'inline-block',background:'#0e1f38',borderRadius:3}}/>;
  return <span className={`fi fi-${code}`} style={{fontSize:'1.4em',lineHeight:1,flexShrink:0}}/>;
}

// ─── Slot clicável ─────────────────────────────────────────────────────────
function Slot({ teamId, side, isWinner, isLoser, onClick }) {
  const td = teamId ? TEAMS[teamId] : null;
  const canClick = !!td && !isWinner && !isLoser;

  return (
    <div
      className={`sim-slot${isWinner?' sim-win':isLoser?' sim-lose':canClick?' sim-pick':' nd'}`}
      onClick={() => canClick && onClick(side)}
    >
      <Flag code={td?.f}/>
      <span className={`sim-name${!td?' sim-tbd':''}`}>
        {td ? td.n : 'A definir'}
      </span>
      {isWinner && <span className="sim-tick">✓</span>}
    </div>
  );
}

// ─── Card de jogo ───────────────────────────────────────────────────────────
function MatchCard({ idx, picks, allS, label, onPick }) {
  const [h, a] = getTeams(idx, picks, allS);
  const winner  = getWinner(idx, picks, allS);

  const handlePick = (side) => {
    const team = side==='h' ? h : a;
    if (!team) return;
    // Limpa picks downstream se mudou a escolha
    onPick(idx, picks[idx]===side ? null : side);
  };

  return (
    <div className={`sim-card${idx===31?' sim-final-card':idx===30?' sim-third-card':''}`}>
      <div className="sim-card-hdr">
        <span>{label}</span>
        {winner && <span className="sim-decided">✓</span>}
      </div>
      <Slot teamId={h} side="h" isWinner={winner&&winner===h} isLoser={winner&&winner!==h&&!!h} onClick={handlePick}/>
      <div className="sim-vs">×</div>
      <Slot teamId={a} side="a" isWinner={winner&&winner===a} isLoser={winner&&winner!==a&&!!a} onClick={handlePick}/>
    </div>
  );
}

// ─── Barra de progresso ─────────────────────────────────────────────────────
function ProgressBar({ picks, allS }) {
  const champ = getWinner(31, picks, allS);
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

// ─── Simulador principal ────────────────────────────────────────────────────
export default function Simulator({ allS }) {
  const [picks, setPicks] = useState({});
  const [round, setRound] = useState('r32');

  // Limpa tudo que dependia do resultado do match idx
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

  const champ    = getWinner(31, picks, allS);
  const terceiro = getWinner(30, picks, allS);
  const totalPicks = Object.values(picks).filter(Boolean).length;
  const currentRound = SIM_ROUNDS.find(r => r.id === round);

  return (
    <div className="sim-wrap">
      {/* Header */}
      <div className="sim-head">
        <div>
          <div className="sim-title">🎯 Simulador de Mata-Mata</div>
          <div className="sim-subtitle">
            Clique no time vencedor de cada jogo · times baseados na classificação atual
          </div>
        </div>
        <button className="sim-reset" onClick={reset}>↺ Resetar</button>
      </div>

      {/* Progresso */}
      <ProgressBar picks={picks} allS={allS}/>

      {/* Banner do campeão */}
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

      {/* Abas de rodada */}
      <div className="sim-rounds">
        {SIM_ROUNDS.map(r => {
          const done  = r.indices.filter(i => picks[i]).length;
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

      {/* Cards da rodada */}
      <div className={`sim-grid${round==='fn'?' sim-grid-final':''}`}>
        {currentRound.indices.map((idx, i) => {
          const lbl = idx===31 ? '🏆 FINAL'
                    : idx===30 ? '🥉 3º LUGAR'
                    : `Jogo ${i+1}`;
          return (
            <MatchCard
              key={idx}
              idx={idx}
              picks={picks}
              allS={allS}
              label={lbl}
              onPick={onPick}
            />
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
