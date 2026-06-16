import { useState, useMemo } from 'react';
import { TEAMS, GK, R32_SRC, getSlotTeam } from './data.js';

// ─── Bracket: 32 matches totais ───────────────────────────────────────────
// 0-15  → Rodada de 32
// 16-23 → Oitavas
// 24-27 → Quartas
// 28-29 → Semis
// 30    → 3º Lugar  (perdedores das semis)
// 31    → Final     (vencedores das semis)

const SIM_ROUNDS = [
  { id:'r32', label:'Rodada de 32', range:[0,15]   },
  { id:'r16', label:'Oitavas',      range:[16,23]  },
  { id:'qf',  label:'Quartas',      range:[24,27]  },
  { id:'sf',  label:'Semifinais',   range:[28,29]  },
  { id:'fn',  label:'Final',        range:[31,30]  }, // Final primeiro, depois 3º
];

/* Retorna o time que está numa vaga (team id string, objeto lbl, ou null) */
function resolveSlot(src, allS, doneGroups) {
  if (!src) return null;
  if (src.lbl) return src; // já é label
  if (src.g !== undefined) {
    if (!doneGroups || !doneGroups.has(src.g))
      return { lbl: `${src.p+1}º Gr.${src.g}` };
    const s = allS[src.g];
    return s && s[src.p] ? s[src.p].id : null;
  }
  return null;
}

/* Retorna [home, away] para qualquer posição do bracket */
function getTeams(idx, picks, allS, doneGroups) {
  if (idx < 16) {
    const [s0, s1] = R32_SRC[idx];
    return [resolveSlot(s0, allS, doneGroups), resolveSlot(s1, allS, doneGroups)];
  }
  const win = (i) => {
    const [h, a] = getTeams(i, picks, allS, doneGroups);
    const p = picks[i];
    if (!p) return null;
    const t = p === 'h' ? h : a;
    return typeof t === 'string' ? t : null;
  };
  const lose = (i) => {
    const [h, a] = getTeams(i, picks, allS, doneGroups);
    const p = picks[i];
    if (!p) return null;
    const t = p === 'h' ? a : h;
    return typeof t === 'string' ? t : null;
  };
  if (idx < 24) { const b=(idx-16)*2;   return [win(b),   win(b+1)];           }
  if (idx < 28) { const b=(idx-24)*2+16; return [win(b),   win(b+1)];           }
  if (idx===28) return [win(24), win(25)];
  if (idx===29) return [win(26), win(27)];
  if (idx===30) return [lose(28), lose(29)];   // 3º lugar
  if (idx===31) return [win(28),  win(29)];    // Final
  return [null, null];
}

function getWinner(idx, picks, allS, doneGroups) {
  const [h, a] = getTeams(idx, picks, allS, doneGroups);
  const p = picks[idx];
  if (!p) return null;
  const t = p === 'h' ? h : a;
  return typeof t === 'string' ? t : null;
}

/* Componente de flag */
function Flag({ code, size='md' }) {
  if (!code) return <span style={{width:28,height:19,display:'inline-block',background:'#0e1f38',borderRadius:3}}/>
  const sz = size==='sm'?'1.1em':size==='lg'?'2em':'1.4em';
  return <span className={`fi fi-${code}`} style={{fontSize:sz,lineHeight:1,flexShrink:0}}/>;
}

/* Slot clicável dentro de um match card */
function Slot({ team, side, winner, onClick, small=false }) {
  const td = team && typeof team==='string' ? TEAMS[team] : null;
  const isLbl = team && typeof team==='object' && team.lbl;
  const isW = winner === team && typeof team==='string';
  const isL = winner && winner !== team && typeof team==='string';
  const canClick = td && !winner;

  return (
    <div
      className={`sim-slot${isW?' sim-win':''}${isL?' sim-lose':''}${canClick?' sim-pick':''}`}
      onClick={() => canClick && onClick(side)}
      style={{padding: small ? '7px 10px' : '10px 14px'}}
    >
      {td ? <Flag code={td.f} size={small?'sm':'md'}/> :
       isLbl ? <span style={{fontSize:'1.1em',opacity:.4,flexShrink:0}}>🏁</span> :
       <span style={{width:22,height:15,background:'#0a1828',borderRadius:3,flexShrink:0,display:'inline-block'}}/>}
      <span className={`sim-name${isLbl?' sim-tbd':''}`} style={{fontSize: small?12:14}}>
        {td ? td.n : isLbl ? team.lbl : 'A definir'}
      </span>
      {isW && <span className="sim-tick">✓</span>}
    </div>
  );
}

/* Um card de jogo */
function MatchCard({ idx, picks, allS, doneGroups, onPick, matchNum, stageLbl, small=false }) {
  const [h, a] = getTeams(idx, picks, allS, doneGroups);
  const winner = getWinner(idx, picks, allS, doneGroups);
  const hT = h && typeof h==='string' ? h : null;
  const aT = a && typeof a==='string' ? a : null;

  const isThird = idx === 30;
  const isFinal = idx === 31;

  return (
    <div className={`sim-card${isFinal?' sim-final-card':''}${isThird?' sim-third-card':''}`}>
      <div className="sim-card-hdr">
        {stageLbl && <span>{stageLbl}</span>}
        {matchNum !== undefined && <span> · Jogo {matchNum}</span>}
        {winner && <span className="sim-decided">✓ definido</span>}
      </div>
      <Slot team={h} side="h" winner={hT && winner ? winner : null} onClick={(s)=>onPick(idx,s)} small={small}/>
      <div className="sim-vs">×</div>
      <Slot team={a} side="a" winner={hT && winner ? winner : null} onClick={(s)=>onPick(idx,s)} small={small}/>
    </div>
  );
}

/* Barra de progresso do bracket */
function BracketBar({ picks, allS, doneGroups }) {
  const champ = getWinner(31, picks, allS, doneGroups);
  const roundWins = [
    {label:'R32', ids: Array.from({length:16},(_,i)=>i)},
    {label:'Oitavas', ids: Array.from({length:8},(_,i)=>i+16)},
    {label:'Quartas', ids: Array.from({length:4},(_,i)=>i+24)},
    {label:'Semis', ids: [28,29]},
    {label:'Final', ids: [31]},
  ];
  return (
    <div className="sim-progress">
      {roundWins.map(r => {
        const done = r.ids.filter(i => picks[i]).length;
        const total = r.ids.length;
        return (
          <div key={r.label} className="sim-prog-item">
            <div className="sim-prog-bar">
              <div className="sim-prog-fill" style={{width:`${(done/total)*100}%`}}/>
            </div>
            <span className="sim-prog-lbl">{r.label} {done}/{total}</span>
          </div>
        );
      })}
      {champ && (
        <div className="sim-prog-champ">
          🏆 <Flag code={TEAMS[champ]?.f} size="sm"/> <b>{TEAMS[champ]?.n}</b>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SIMULADOR PRINCIPAL
═══════════════════════════════════════════════════════ */
export default function Simulator({ allS, doneGroups }) {
  const [picks, setPicks] = useState({});
  const [round, setRound] = useState('r32');

  const onPick = (idx, side) => {
    setPicks(p => {
      const next = { ...p };
      if (next[idx] === side) {
        // Desfaz o pick e limpa tudo que dependia desse resultado
        next[idx] = null;
        clearDownstream(idx, next);
      } else {
        next[idx] = side;
        // Se mudou o pick, limpa o caminho que o time anterior estava fazendo
        clearDownstream(idx, next);
      }
      return next;
    });
  };

  const clearDownstream = (idx, next) => {
    // Limpa picks que dependem de idx
    const deps = getDeps(idx);
    deps.forEach(d => {
      next[d] = null;
      clearDownstream(d, next);
    });
  };

  const getDeps = (idx) => {
    // Quais matches dependem do resultado de idx?
    const result = [];
    if (idx < 16) result.push(16 + Math.floor(idx/2));
    else if (idx < 24) result.push(24 + Math.floor((idx-16)/2));
    else if (idx < 28) result.push(28 + Math.floor((idx-24)/2));
    else if (idx === 28 || idx === 29) { result.push(30); result.push(31); }
    return result;
  };

  const resetAll = () => setPicks({});

  const champ = getWinner(31, picks, allS, doneGroups);
  const terceiro = getWinner(30, picks, allS, doneGroups);
  const totalPicks = Object.values(picks).filter(Boolean).length;

  const currentRound = SIM_ROUNDS.find(r => r.id === round);
  const [rMin, rMax] = currentRound.range[0] <= currentRound.range[1]
    ? [currentRound.range[0], currentRound.range[1]]
    : [currentRound.range[1], currentRound.range[0]];
  const matchIndices = round === 'fn'
    ? [31, 30]   // Final primeiro, 3º lugar depois
    : Array.from({length: rMax - rMin + 1}, (_, i) => rMin + i);

  return (
    <div className="sim-wrap">
      {/* ── HEADER ── */}
      <div className="sim-head">
        <div>
          <div className="sim-title">🎯 Simulador de Mata-Mata</div>
          <div className="sim-subtitle">Monte seu palpite do bracket completo — clique no time vencedor de cada jogo</div>
        </div>
        <button className="sim-reset" onClick={resetAll}>↺ Resetar</button>
      </div>

      {/* ── BARRA DE PROGRESSO ── */}
      <BracketBar picks={picks} allS={allS} doneGroups={doneGroups}/>

      {/* ── CAMPEÃO ── */}
      {champ && (
        <div className="sim-champ-banner">
          <span className="sim-champ-trophy">🏆</span>
          <div>
            <div className="sim-champ-lbl">Seu Campeão Simulado</div>
            <div className="sim-champ-name">
              <Flag code={TEAMS[champ]?.f} size="lg"/>
              <span>{TEAMS[champ]?.n}</span>
            </div>
          </div>
          {terceiro && (
            <div className="sim-third-info">
              🥉 3º: <Flag code={TEAMS[terceiro]?.f} size="sm"/> {TEAMS[terceiro]?.n}
            </div>
          )}
        </div>
      )}

      {/* ── ROUND TABS ── */}
      <div className="sim-rounds">
        {SIM_ROUNDS.map(r => {
          const [mn, mx] = r.range[0]<=r.range[1] ? [r.range[0],r.range[1]] : [r.range[1],r.range[0]];
          const total = mx - mn + 1;
          const done  = Array.from({length:total},(_,i)=>mn+i).filter(i=>picks[i]).length;
          return (
            <button key={r.id}
              className={`sim-round-btn${round===r.id?' on':''}`}
              onClick={()=>setRound(r.id)}>
              {r.label}
              <span className="sim-round-count">{done}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* ── MATCH CARDS ── */}
      <div className={`sim-grid${round==='fn'?' sim-grid-final':''}`}>
        {matchIndices.map((idx, i) => {
          const stageLabels = {
            31:'🏆 FINAL', 30:'🥉 3º Lugar',
          };
          const stageLbl = round==='fn'
            ? stageLabels[idx]
            : undefined;
          const matchNum = round!=='fn' ? i+1 : undefined;
          return (
            <MatchCard
              key={idx}
              idx={idx}
              picks={picks}
              allS={allS}
              doneGroups={doneGroups}
              onPick={onPick}
              matchNum={matchNum}
              stageLbl={stageLbl}
            />
          );
        })}
      </div>

      <div className="hint">
        💡 {totalPicks} de 31 jogos definidos
        {totalPicks > 0 && <> · <button className="sim-link" onClick={resetAll}>Limpar tudo</button></>}
      </div>
    </div>
  );
}
