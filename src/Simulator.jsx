import { useState, useMemo } from 'react';
import { TEAMS, R32_SRC } from './data.js';

// ── Bracket ──────────────────────────────────────────────
// idx  0-15 : Rodada de 32
// idx 16-23 : Oitavas      Oitavas[k] = win(2k)   vs win(2k+1)
// idx 24-27 : Quartas      Quartas[k] = win(16+2k) vs win(16+2k+1)
// idx 28-29 : Semifinais   28=win(24)×win(25)  29=win(26)×win(27)
// idx 30    : 3º Lugar     lose(28) × lose(29)
// idx 31    : Final        win(28)  × win(29)

const ROUNDS = [
  { id:'r32', label:'Rodada de 32', idx: Array.from({length:16},(_,i)=>i)   },
  { id:'r16', label:'Oitavas',      idx: Array.from({length:8},(_,i)=>i+16) },
  { id:'qf',  label:'Quartas',      idx: Array.from({length:4},(_,i)=>i+24) },
  { id:'sf',  label:'Semifinais',   idx: [28,29]                            },
  { id:'fn',  label:'Final',        idx: [31,30]                            },
];

// Resolve a vaga de um slot no R32_SRC
function resolveR32Slot(src, allS) {
  if (!src || src.lbl) return null;
  const s = allS[src.g];
  return s?.[src.p]?.id ?? null;
}

// Retorna [home, away] para qualquer idx do bracket
function slotTeams(idx, picks, allS, r32Map) {
  if (idx < 16) {
    const [s0, s1] = R32_SRC[idx];
    // Slot de 1º/2º colocado — usa classificação do grupo
    if (!s0.lbl && !s1.lbl) {
      return [resolveR32Slot(s0, allS), resolveR32Slot(s1, allS)];
    }
    // Slot de melhor 3º — usa chaveamento real da API (r32Map)
    const g0 = resolveR32Slot(s0, allS);
    return [g0, g0 ? (r32Map[g0] ?? null) : null];
  }
  const W = (i) => {
    const [h, a] = slotTeams(i, picks, allS, r32Map);
    const p = picks[i];
    return p ? (p==='h' ? h : a) : null;
  };
  const L = (i) => {
    const [h, a] = slotTeams(i, picks, allS, r32Map);
    const p = picks[i];
    return p ? (p==='h' ? a : h) : null;
  };
  if (idx < 24) { const b=(idx-16)*2;     return [W(b),   W(b+1)]; }
  if (idx < 28) { const b=(idx-24)*2+16;  return [W(b),   W(b+1)]; }
  if (idx===28)  return [W(24), W(25)];
  if (idx===29)  return [W(26), W(27)];
  if (idx===30)  return [L(28), L(29)]; // 3º Lugar
  if (idx===31)  return [W(28), W(29)]; // Final
  return [null, null];
}

function winner(idx, picks, allS, r32Map) {
  const [h, a] = slotTeams(idx, picks, allS, r32Map);
  const p = picks[idx];
  return p ? (p==='h' ? h : a) : null;
}

// ── Flag ───────────────────────────────────────────────────
function Flag({ code, lg }) {
  if (!code) return <span style={{width:lg?30:22,height:lg?20:15,display:'inline-block',background:'#0e1f38',borderRadius:3}}/>;
  return <span className={`fi fi-${code}`} style={{fontSize:lg?'1.9em':'1.3em',lineHeight:1,flexShrink:0}}/>;
}

// ── Slot clicável ──────────────────────────────────────────
function Slot({ id, side, win, lose, onPick }) {
  const td = id ? TEAMS[id] : null;
  return (
    <div
      className={`sim-slot${win?' sim-win':lose?' sim-lose':td?' sim-pick':' nd'}`}
      onClick={() => td && onPick(side)}
    >
      <Flag code={td?.f}/>
      <span className={`sim-name${!td?' sim-tbd':''}`}>{td ? td.n : 'A definir'}</span>
      {win && <span className="sim-tick">✓</span>}
    </div>
  );
}

// ── Card de jogo ──────────────────────────────────────────
function Card({ idx, picks, allS, r32Map, label, onPick }) {
  const [h, a] = slotTeams(idx, picks, allS, r32Map);
  const w = winner(idx, picks, allS, r32Map);
  const pick = (side) => {
    if (side==='h' && !h) return;
    if (side==='a' && !a) return;
    onPick(idx, picks[idx]===side ? null : side);
  };
  return (
    <div className={`sim-card${idx===31?' sim-final-card':idx===30?' sim-third-card':''}`}>
      <div className="sim-card-hdr">
        <span>{label}</span>
        {w && <span className="sim-decided">✓</span>}
      </div>
      <Slot id={h} side="h" win={!!(w&&w===h)} lose={!!(w&&w!==h&&h)} onPick={pick}/>
      <div className="sim-vs">×</div>
      <Slot id={a} side="a" win={!!(w&&w===a)} lose={!!(w&&w!==a&&a)} onPick={pick}/>
    </div>
  );
}

// ── SIMULADOR ─────────────────────────────────────────────
export default function Simulator({ allS, koApi }) {
  const [picks, setPicks] = useState({});
  const [tab, setTab]     = useState('r32');

  // Mapa teamId → adversário real na Rodada de 32 (dados direto da API)
  // Resolve o chaveamento FIFA dos melhores 3ºs (495 cenários impossíveis de calcular)
  const r32Map = useMemo(() => {
    const m = {};
    (koApi||[])
      .filter(x => x.stage==='LAST_32' && x.h && x.a)
      .forEach(x => { m[x.h]=x.a; m[x.a]=x.h; });
    return m;
  }, [koApi]);

  // Limpa picks que dependiam de idx
  const wipe = (idx, nx) => {
    const deps =
      idx<16  ? [16+Math.floor(idx/2)] :
      idx<24  ? [24+Math.floor((idx-16)/2)] :
      idx<28  ? [28+Math.floor((idx-24)/2)] :
      (idx===28||idx===29) ? [30,31] : [];
    deps.forEach(d => { nx[d]=null; wipe(d,nx); });
  };

  const pick = (idx, side) => {
    setPicks(prev => {
      const nx = {...prev};
      if (!side) { nx[idx]=null; wipe(idx,nx); }
      else       { if(prev[idx]&&prev[idx]!==side) wipe(idx,nx); nx[idx]=side; }
      return nx;
    });
  };

  const champ    = winner(31, picks, allS, r32Map);
  const terceiro = winner(30, picks, allS, r32Map);
  const total    = Object.values(picks).filter(Boolean).length;
  const round    = ROUNDS.find(r => r.id===tab);

  return (
    <div className="sim-wrap">

      {/* ── Header ── */}
      <div className="sim-head">
        <div>
          <div className="sim-title">🎯 Simulador de Mata-Mata</div>
          <div className="sim-subtitle">Clique no time vencedor · chaveamento oficial FIFA</div>
        </div>
        <button className="sim-reset" onClick={()=>setPicks({})}>↺ Resetar</button>
      </div>

      {/* ── Barra de progresso ── */}
      <div className="sim-progress">
        {ROUNDS.map(r => {
          const done = r.idx.filter(i=>picks[i]).length;
          return (
            <div key={r.id} className="sim-prog-item">
              <div className="sim-prog-bar">
                <div className="sim-prog-fill" style={{width:`${(done/r.idx.length)*100}%`}}/>
              </div>
              <span className="sim-prog-lbl">{r.label} {done}/{r.idx.length}</span>
            </div>
          );
        })}
        {champ && (
          <div className="sim-prog-champ">
            🏆 <Flag code={TEAMS[champ]?.f}/> <b>{TEAMS[champ]?.n}</b>
          </div>
        )}
      </div>

      {/* ── Banner do campeão ── */}
      {champ && (
        <div className="sim-champ-banner">
          <span className="sim-champ-trophy">🏆</span>
          <div>
            <div className="sim-champ-lbl">Seu Campeão Simulado</div>
            <div className="sim-champ-name">
              <Flag code={TEAMS[champ]?.f} lg/>
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

      {/* ── Abas de rodada ── */}
      <div className="sim-rounds">
        {ROUNDS.map(r => {
          const done = r.idx.filter(i=>picks[i]).length;
          return (
            <button key={r.id}
              className={`sim-round-btn${tab===r.id?' on':''}`}
              onClick={()=>setTab(r.id)}>
              {r.label}
              <span className="sim-round-count">{done}/{r.idx.length}</span>
            </button>
          );
        })}
      </div>

      {/* ── Cards ── */}
      <div className={`sim-grid${tab==='fn'?' sim-grid-final':''}`}>
        {round.idx.map((idx,i) => (
          <Card key={idx} idx={idx} picks={picks}
            allS={allS} r32Map={r32Map}
            label={idx===31?'🏆 FINAL':idx===30?'🥉 3º LUGAR':`Jogo ${i+1}`}
            onPick={pick}/>
        ))}
      </div>

      <div className="hint">
        💡 {total}/31 jogos definidos
        {total>0 && <> · <button className="sim-link" onClick={()=>setPicks({})}>Limpar tudo</button></>}
      </div>

    </div>
  );
}
