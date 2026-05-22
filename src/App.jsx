import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  TEAMS, GROUPS, GK, KO_ROUNDS, R32_SRC,
  initGroupMatches, calcStandings, getSlotTeam, getMatchTeams,
  KO_SCHEDULE,
} from './data.js';
import { fetchMatches, hasApiKey } from './api.js';

/* ── FLAG COMPONENT (flag-icons CSS library) ── */
function Flag({ code, size = 'md' }) {
  const sz = size === 'sm' ? '1.1em' : size === 'lg' ? '2.2em' : '1.5em';
  return <span className={`fi fi-${code}`} style={{ fontSize: sz, lineHeight: 1 }} />;
}

/* ── LIVE PULSE DOT ── */
function LiveDot() {
  return (
    <span style={{
      display:'inline-block',width:7,height:7,borderRadius:'50%',
      background:'#22c55e',boxShadow:'0 0 6px #22c55e',
      animation:'pulse 1.5s infinite',marginRight:4,flexShrink:0,
    }}/>
  );
}

/* ── FORMAT DATE ── */
function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-BR',{
      day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo',
    });
  } catch{ return ''; }
}

/* ════════════════════════════════════════════
   APP
════════════════════════════════════════════ */
export default function App() {
  const [tab,  setTab]  = useState('grupos');
  const [ag,   setAg]   = useState('A');
  const [gm,   setGm]   = useState(initGroupMatches);
  const [em,   setEm]   = useState(null);
  const [kr,   setKr]   = useState('r32');
  const [koW,  setKoW]  = useState(() => { const w={}; for(let i=0;i<32;i++) w[i]=null; return w; });
  const [apiStatus, setApiStatus] = useState('idle'); // idle | loading | ok | error | no_key
  const [lastSync,  setLastSync]  = useState(null);
  const timerRef = useRef(null);

  /* ── DERIVED ── */
  const allS = useMemo(() => {
    const s={}; GK.forEach(g => s[g]=calcStandings(g,gm)); return s;
  }, [gm]);

  const { gp, tg } = useMemo(() => {
    const pl = Object.values(gm).filter(m => m.hs !== null);
    return { gp: pl.length, tg: pl.reduce((a,m) => a+m.hs+m.as, 0) };
  }, [gm]);

  const hasLive = useMemo(() => Object.values(gm).some(m => m.live), [gm]);
  const champ   = koW[31];

  /* ── API FETCH ── */
  const doFetch = useCallback(async () => {
    if (!hasApiKey()) { setApiStatus('no_key'); return; }
    setApiStatus('loading');
    const { groupMatches, error } = await fetchMatches(gm);
    if (error) {
      setApiStatus(error === 'no_key' ? 'no_key' : 'error');
    } else {
      setGm(groupMatches);
      setApiStatus('ok');
      setLastSync(new Date());
    }
  }, [gm]);

  /* Auto-fetch: a cada 60s durante jogos ao vivo, 5min caso contrário */
  useEffect(() => {
    doFetch();
    const interval = hasLive ? 60_000 : 300_000;
    timerRef.current = setInterval(doFetch, interval);
    return () => clearInterval(timerRef.current);
  }, [hasLive]); // eslint-disable-line

  /* ── SCORE HANDLERS ── */
  const saveScore = useCallback(() => {
    if (!em) return;
    const hs = parseInt(em.hs, 10), as = parseInt(em.as, 10);
    if (isNaN(hs)||isNaN(as)||hs<0||as<0) return;
    setGm(p => ({ ...p, [em.id]: { ...p[em.id], hs, as } }));
    setEm(null);
  }, [em]);

  const clearScore = useCallback(() => {
    if (!em) return;
    setGm(p => ({ ...p, [em.id]: { ...p[em.id], hs:null, as:null } }));
    setEm(null);
  }, [em]);

  const advance = useCallback((idx, team) => {
    if (!team || typeof team === 'object') return;
    setKoW(p => ({ ...p, [idx]: team }));
  }, []);

  /* ════ RENDER ════ */
  return (
    <div className="wc">

      {/* ── HEADER ── */}
      <header className="hdr">
        <div className="hdr-badge">⚽ FIFA World Cup 2026</div>
        <h1 className="hdr-title">Copa do <em>Mundo</em> 2026</h1>
        <p className="hdr-sub">11 Jun – 19 Jul · 48 Seleções · 104 Partidas</p>
        <div className="hdr-hosts">
          <div className="hdr-host"><Flag code="us" size="sm"/> EUA (11 cidades)</div>
          <div className="hdr-host"><Flag code="mx" size="sm"/> México (3 cidades)</div>
          <div className="hdr-host"><Flag code="ca" size="sm"/> Canadá (2 cidades)</div>
        </div>
        <div className="hdr-api">
          <span className={`dot${apiStatus==='ok'||hasLive?' live':''}`}/>
          {apiStatus==='ok'   && `Atualizado ${lastSync?.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`}
          {apiStatus==='loading' && 'Atualizando...'}
          {apiStatus==='error'   && 'API indisponível · usando calendário local'}
          {apiStatus==='no_key'  && 'Sem chave de API · resultados manuais'}
          {apiStatus==='idle'    && 'Iniciando...'}
          {hasLive && <><LiveDot/><strong style={{color:'#22c55e'}}>AO VIVO</strong></>}
        </div>
      </header>

      {/* ── API KEY BANNER ── */}
      {apiStatus==='no_key' && (
        <div className="api-banner">
          ⚙️ Para resultados ao vivo a partir de 11/jun, adicione sua chave gratuita em{' '}
          <a href="https://www.football-data.org/client/register" target="_blank" rel="noreferrer">
            football-data.org
          </a>
          {' '}como variável <code>VITE_FOOTBALL_API_KEY</code> no Vercel.
        </div>
      )}

      {/* ── STATS BAR ── */}
      <div className="stats">
        {[
          ['48','Seleções'],['12','Grupos'],['104','Partidas'],
          [gp,'Jogados'],[tg,'Gols'],
          champ ? [TEAMS[champ]?.s??'–','Campeão 🏆'] : ['–','Campeão'],
        ].map(([v,l],i)=>(
          <div className="stat" key={i}>
            <div className="stat-v">{v}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN TABS ── */}
      <div className="tabs">
        <button className={`tab${tab==='grupos'?' on':''}`} onClick={()=>setTab('grupos')}>
          ⚽ Fase de Grupos
        </button>
        <button className={`tab${tab==='matamat'?' on':''}`} onClick={()=>setTab('matamat')}>
          🏆 Mata-Mata
        </button>
      </div>

      {/* ════ GRUPOS ════ */}
      {tab==='grupos' && <>
        <div className="gsbar">
          {GK.map(g=>(
            <button key={g} className={`gbtn${ag===g?' on':''}`} onClick={()=>setAg(g)}>{g}</button>
          ))}
        </div>

        <div className="content">
          <div className="gview">

            {/* STANDINGS */}
            <div className="card">
              <div className="ctitle">📊 Classificação — Grupo {ag}</div>
              <table className="sttbl">
                <thead>
                  <tr>
                    <th>Seleção</th>
                    <th>J</th><th>V</th><th>E</th><th>D</th>
                    <th>GP</th><th>GC</th><th>SG</th><th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {allS[ag].map((st,i)=>{
                    const t=TEAMS[st.id]; const gd=st.gf-st.ga;
                    return(
                      <tr key={st.id} className={i<2?'q':''}>
                        <td>
                          <div className="tcell">
                            <span className={`pbadge p${i+1}`}>{i+1}</span>
                            <Flag code={t.f}/>
                            <span>{t.n}</span>
                          </div>
                        </td>
                        <td>{st.p}</td><td>{st.w}</td><td>{st.d}</td><td>{st.l}</td>
                        <td>{st.gf}</td><td>{st.ga}</td>
                        <td style={{color:gd>0?'#5ae080':gd<0?'#e06060':'inherit'}}>
                          {gd>0?'+'+gd:gd}
                        </td>
                        <td>{st.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="q-hint">🟡 Top 2 classificados · 3os melhores também podem avançar</div>
            </div>

            {/* MATCHES */}
            <div className="card">
              <div className="ctitle">
                📅 Jogos — Grupo {ag}
                {hasApiKey() && (
                  <button onClick={doFetch} style={{marginLeft:'auto',background:'none',border:'1px solid #1a3050',borderRadius:6,color:'#4a6a8a',cursor:'pointer',padding:'2px 8px',fontSize:10,letterSpacing:1}}>
                    ↻ Atualizar
                  </button>
                )}
              </div>
              {Object.values(gm).filter(m=>m.g===ag).sort((a,b)=>!a.date?1:!b.date?-1:new Date(a.date)-new Date(b.date)).map(m=>{
                const h=TEAMS[m.h], a=TEAMS[m.a], done=m.hs!==null;
                return(
                  <div key={m.id} className={`mitem${m.live?' live-match':''}`}
                    onClick={()=>setEm({id:m.id,hs:m.hs??'',as:m.as??''})}>
                    {m.live && <span className="live-badge">AO VIVO</span>}
                    <div className="mteam">
                      <Flag code={h.f} size="sm"/>
                      <span>{h.s}</span>
                    </div>
                    <div className={`mscore${done?(m.live?' live':' done'):''}`}>
                      {done ? `${m.hs} – ${m.as}` : (m.date ? fmtDate(m.date) : '– : –')}
                    </div>
                    <div className="mteam r">
                      <span>{a.s}</span>
                      <Flag code={a.f} size="sm"/>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ALL GROUPS OVERVIEW */}
          <div style={{marginTop:20}}>
            <div className="card">
              <div className="ctitle">🌐 Visão Geral — Todos os Grupos</div>
              <div className="ov-grid">
                {GK.map(g=>(
                  <div key={g} className="ov-cell" onClick={()=>setAg(g)}>
                    <div className="ov-lbl">Grupo {g}</div>
                    {GROUPS[g].map(tid=>{
                      const t=TEAMS[tid];
                      const pos=allS[g].findIndex(s=>s.id===tid);
                      const st=allS[g].find(s=>s.id===tid);
                      return(
                        <div key={tid} className="ov-row" style={{opacity:pos<2?1:.6}}>
                          <Flag code={t.f} size="sm"/>
                          <span style={{fontSize:12,color:pos<2?'#b0c8e0':'#5a7a9a',flex:1}}>{t.s}</span>
                          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:pos<2?'#f0b429':'#3a5070'}}>
                            {st?.pts??0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>}

      {/* ════ MATA-MATA ════ */}
      {tab==='matamat' && <>
        <div className="korbar">
          {KO_ROUNDS.map(r=>(
            <button key={r.id} className={`krbtn${kr===r.id?' on':''}`} onClick={()=>setKr(r.id)}>
              {r.label}
            </button>
          ))}
        </div>

        {kr==='final' && champ && (
          <div className="champ">
            <div className="champl">🏆 Campeão do Mundo 2026</div>
            <div style={{fontSize:56}}>🏆</div>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:14,marginTop:12}}>
              <Flag code={TEAMS[champ]?.f} size="lg"/>
              <div className="champt">{TEAMS[champ]?.n}</div>
            </div>
          </div>
        )}

        <div className="kogrid">
          {KO_ROUNDS.find(r=>r.id===kr)?.matches.map(idx=>{
            const [home,away]=getMatchTeams(idx,koW,allS);
            const winner=koW[idx];
            const lbl=
              idx===31?'🏆 FINAL': idx===30?'🥉 3º LUGAR':
              idx<16 ?`32-avos · Jogo ${idx+1}`:
              idx<24 ?`Oitavas · Jogo ${idx-15}`:
              idx<28 ?`Quartas · Jogo ${idx-23}`:
              `Semifinal ${idx-27}`;

            const Slot=({team})=>{
              const isW=winner!=null&&team===winner;
              const isL=winner&&team!==winner&&team&&typeof team!=='object';
              const isLabel=team&&typeof team==='object'&&team.lbl;
              const td=team&&typeof team==='string'?TEAMS[team]:null;
              const nd=!team||typeof team==='object';
              return(
                <div className={`koslot${isW?' win':''}${isL?' lose':''}${nd?' nd':''}`}
                  onClick={()=>td&&advance(idx,team)}>
                  {td ? <Flag code={td.f}/> :
                   isLabel ? <span style={{fontSize:'1.2em',opacity:.4}}>🏁</span> :
                   <span style={{fontSize:'1.2em',opacity:.2}}>?</span>}
                  {td?
                    <span className="koname">{td.n}</span>:
                    isLabel?<span className="koname tbd">{team.lbl}</span>:
                    <span className="koname tbd">A definir</span>}
                  {isW && <span className="kotick">✓</span>}
                </div>
              );
            };

            return(
              <div key={idx} className="kocard">
                <div className="kochdr">{lbl}</div>
                <Slot team={home}/>
                <Slot team={away}/>
                {KO_SCHEDULE[idx] && (
                  <div style={{padding:'5px 12px 7px',borderTop:'1px solid #0e2040',
                    display:'flex',alignItems:'center',gap:6,
                    fontSize:11,color:'#3a5a78',letterSpacing:'0.5px'}}>
                    <span>📅</span>
                    <span style={{color:'#4a6a8a'}}>{KO_SCHEDULE[idx].d}</span>
                    {KO_SCHEDULE[idx].t && <><span style={{color:'#1e3050'}}>·</span><span style={{color:'#3a5a78'}}>{KO_SCHEDULE[idx].t} BRT</span></>}
                    {KO_SCHEDULE[idx].c && <><span style={{color:'#1e3050'}}>·</span><span style={{color:'#3a5a78',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{KO_SCHEDULE[idx].c}</span></>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="hint">
          💡 Clique em uma seleção para avançá-la · Resultados da fase de grupos populam automaticamente
        </div>
      </>}

      {/* ════ SCORE MODAL ════ */}
      {em && (() => {
        const m=gm[em.id]; if(!m) return null;
        const h=TEAMS[m.h], a=TEAMS[m.a];
        return(
          <div className="ov" onClick={()=>setEm(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="mtitle">✏️ EDITAR PLACAR</div>
              <div className="mmatch">
                <div className="mmt">
                  <Flag code={h.f} size="lg"/>
                  <div className="mmn">{h.n}</div>
                  <input className="sinput" type="number" min="0" max="30"
                    value={em.hs}
                    onChange={e=>setEm(p=>({...p,hs:e.target.value}))}
                    onKeyDown={e=>{if(e.key==='Enter')saveScore();if(e.key==='Escape')setEm(null);}}
                    autoFocus
                  />
                </div>
                <div className="mvs">×</div>
                <div className="mmt">
                  <Flag code={a.f} size="lg"/>
                  <div className="mmn">{a.n}</div>
                  <input className="sinput" type="number" min="0" max="30"
                    value={em.as}
                    onChange={e=>setEm(p=>({...p,as:e.target.value}))}
                    onKeyDown={e=>{if(e.key==='Enter')saveScore();if(e.key==='Escape')setEm(null);}}
                  />
                </div>
              </div>
              <div className="mact">
                <button className="btn btn-no" onClick={()=>setEm(null)}>Cancelar</button>
                {m.hs!==null && <button className="btn btn-del" onClick={clearScore}>Limpar</button>}
                <button className="btn btn-ok" onClick={saveScore}>Salvar</button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
