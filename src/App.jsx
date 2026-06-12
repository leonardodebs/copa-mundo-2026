import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { TEAMS, GROUPS, GK, initGroupMatches, calcStandings } from './data.js';
import { fetchMatches } from './api.js';

/* ── FLAG ── */
function Flag({ code, size = 'md' }) {
  if (!code) return <span style={{fontSize:'1.2em',opacity:.25,width:32,textAlign:'center',display:'inline-block'}}>?</span>;
  const sz = size === 'sm' ? '1.1em' : size === 'lg' ? '2.2em' : '1.5em';
  return <span className={`fi fi-${code}`} style={{ fontSize: sz, lineHeight: 1 }} />;
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo',
    });
  } catch { return ''; }
}
function fmtTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' });
  } catch { return ''; }
}
function sameDayBRT(iso, ref) {
  if (!iso) return false;
  const opt = { timeZone:'America/Sao_Paulo' };
  return new Date(iso).toLocaleDateString('pt-BR', opt) === ref.toLocaleDateString('pt-BR', opt);
}

const KO_VIEW = [
  { id:'LAST_32',        label:'Rodada de 32' },
  { id:'LAST_16',        label:'Oitavas' },
  { id:'QUARTER_FINALS', label:'Quartas' },
  { id:'SEMI_FINALS',    label:'Semifinais' },
  { id:'FINALS',         label:'Final & 3º' },
];
const STAGE_NAMES = {
  LAST_32:'Rodada de 32', LAST_16:'Oitavas', QUARTER_FINALS:'Quartas',
  SEMI_FINALS:'Semifinal', THIRD_PLACE:'🥉 3º Lugar', FINAL:'🏆 FINAL',
};

export default function App() {
  const [tab, setTab] = useState('grupos');
  const [ag,  setAg]  = useState('A');
  const [gm,  setGm]  = useState(initGroupMatches);
  const [koApi, setKoApi] = useState([]);
  const [kr,  setKr]  = useState('LAST_32');
  const [picks, setPicks] = useState({});          // palpites: { [matchId]: 'h'|'a' }
  const [apiStatus, setApiStatus] = useState('idle');
  const [lastSync,  setLastSync]  = useState(null);
  const [now, setNow] = useState(() => new Date());
  const gmRef = useRef(gm);
  useEffect(() => { gmRef.current = gm; }, [gm]);

  /* relógio para countdown */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const allS = useMemo(() => {
    const s = {}; GK.forEach(g => s[g] = calcStandings(g, gm)); return s;
  }, [gm]);

  const { gp, tg } = useMemo(() => {
    const pl = Object.values(gm).filter(m => m.hs !== null);
    return { gp: pl.length, tg: pl.reduce((a,m) => a + m.hs + m.as, 0) };
  }, [gm]);

  const hasLive = useMemo(
    () => Object.values(gm).some(m => m.live) || koApi.some(m => m.live),
    [gm, koApi]
  );

  /* ── todos os jogos com data (grupos + mata-mata) ── */
  const allDated = useMemo(() => {
    const g = Object.values(gm).filter(m => m.date).map(m => ({
      key:`g-${m.id}`, date:m.date, h:m.h, a:m.a, hs:m.hs, as:m.as,
      live:m.live, status:m.status, label:`Grupo ${m.g}`,
    }));
    const k = koApi.map(m => ({
      key:`k-${m.id}`, date:m.date, h:m.h, a:m.a, hs:m.hs, as:m.as,
      live:m.live, status:m.status, label:STAGE_NAMES[m.stage] || m.stage,
    }));
    return [...g, ...k].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [gm, koApi]);

  const todayMatches = useMemo(
    () => allDated.filter(m => sameDayBRT(m.date, now)),
    [allDated, now]
  );
  const nextMatch = useMemo(
    () => allDated.find(m => new Date(m.date) > now && m.status !== 'FINISHED' && !m.live),
    [allDated, now]
  );
  const countdown = useMemo(() => {
    if (!nextMatch) return null;
    let s = Math.max(0, Math.floor((new Date(nextMatch.date) - now) / 1000));
    const d = Math.floor(s/86400); s %= 86400;
    const h = Math.floor(s/3600);  s %= 3600;
    const m = Math.floor(s/60);    s %= 60;
    return d > 0 ? `${d}d ${h}h ${m}m` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, [nextMatch, now]);

  /* ── campeão (direto da API) ── */
  const finalMatch = koApi.find(m => m.stage === 'FINAL');
  const champ = useMemo(() => {
    if (!finalMatch || finalMatch.status !== 'FINISHED') return null;
    if (finalMatch.winner === 'HOME_TEAM') return finalMatch.h;
    if (finalMatch.winner === 'AWAY_TEAM') return finalMatch.a;
    if (finalMatch.pen) return finalMatch.pen.home > finalMatch.pen.away ? finalMatch.h : finalMatch.a;
    return null;
  }, [finalMatch]);

  /* ── fetch automático ── */
  const doFetch = useCallback(async () => {
    setApiStatus('loading');
    const { groupMatches, koMatches, error } = await fetchMatches(gmRef.current);
    if (error) {
      setApiStatus('error');
    } else {
      setGm(groupMatches);
      setKoApi(koMatches);
      setApiStatus('ok');
      setLastSync(new Date());
    }
  }, []);

  useEffect(() => {
    doFetch();
    const interval = hasLive ? 60_000 : 300_000;
    const t = setInterval(doFetch, interval);
    return () => clearInterval(t);
  }, [hasLive, doFetch]);

  const togglePick = useCallback((id, side) => {
    setPicks(p => ({ ...p, [id]: p[id] === side ? null : side }));
  }, []);

  /* ════ RENDER ════ */
  return (
    <div className="wc">

      <header className="hdr">
        <div className="hdr-badge">⚽ FIFA World Cup 2026</div>
        <h1 className="hdr-title">Copa do <em>Mundo</em> 2026</h1>
        <p className="hdr-sub">11 Jun – 19 Jul · 48 Seleções · 104 Partidas</p>
        <div className="hdr-hosts">
          <div className="hdr-host"><Flag code="us" size="sm"/> EUA</div>
          <div className="hdr-host"><Flag code="mx" size="sm"/> México</div>
          <div className="hdr-host"><Flag code="ca" size="sm"/> Canadá</div>
        </div>
        <div className="hdr-api">
          <span className={`dot${apiStatus==='ok'||hasLive?' live':''}`}/>
          {apiStatus==='ok'      && `Atualizado ${lastSync?.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`}
          {apiStatus==='loading' && 'Atualizando...'}
          {apiStatus==='error'   && 'API indisponível · tentando novamente'}
          {apiStatus==='idle'    && 'Iniciando...'}
          {hasLive && <strong style={{color:'#22c55e',marginLeft:6}}>● AO VIVO</strong>}
        </div>
      </header>

      {/* ════ JOGOS DE HOJE + COUNTDOWN ════ */}
      {(todayMatches.length > 0 || nextMatch) && (
        <div className="today">
          <div className="today-head">
            <span className="today-title">📅 Jogos de Hoje</span>
            {nextMatch && countdown && (
              <span className="today-count">
                Próximo: <Flag code={TEAMS[nextMatch.h]?.f} size="sm"/> {TEAMS[nextMatch.h]?.s ?? '?'} × {TEAMS[nextMatch.a]?.s ?? '?'} <Flag code={TEAMS[nextMatch.a]?.f} size="sm"/>
                <strong className="today-timer">⏱ {countdown}</strong>
              </span>
            )}
          </div>
          {todayMatches.length > 0 && (
            <div className="today-row">
              {todayMatches.map(m => {
                const h = TEAMS[m.h], a = TEAMS[m.a];
                const done = m.status === 'FINISHED';
                return (
                  <div key={m.key} className={`today-chip${m.live?' live':''}`}>
                    <span className="today-lbl">{m.label}</span>
                    <div className="today-teams">
                      <Flag code={h?.f} size="sm"/> <b>{h?.s ?? '?'}</b>
                      <span className={`today-score${m.live?' live':''}${done?' done':''}`}>
                        {(m.hs !== null && m.hs !== undefined) ? `${m.hs}–${m.as}` : fmtTime(m.date)}
                      </span>
                      <b>{a?.s ?? '?'}</b> <Flag code={a?.f} size="sm"/>
                    </div>
                    {m.live && <span className="today-live">AO VIVO</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="stats">
        {[
          ['48','Seleções'],['12','Grupos'],['104','Partidas'],
          [gp,'Jogados'],[tg,'Gols'],
          champ ? [TEAMS[champ]?.s ?? '–','Campeão 🏆'] : ['–','Campeão'],
        ].map(([v,l],i)=>(
          <div className="stat" key={i}>
            <div className="stat-v">{v}</div>
            <div className="stat-l">{l}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        <button className={`tab${tab==='grupos'?' on':''}`} onClick={()=>setTab('grupos')}>⚽ Fase de Grupos</button>
        <button className={`tab${tab==='matamat'?' on':''}`} onClick={()=>setTab('matamat')}>🏆 Mata-Mata</button>
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
                        <td style={{color:gd>0?'#5ae080':gd<0?'#e06060':'inherit'}}>{gd>0?'+'+gd:gd}</td>
                        <td>{st.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="q-hint">🟡 Top 2 classificados · 3os melhores também podem avançar</div>
            </div>

            <div className="card">
              <div className="ctitle">📅 Jogos — Grupo {ag}</div>
              {Object.values(gm).filter(m=>m.g===ag)
                .sort((a,b)=>!a.date?1:!b.date?-1:new Date(a.date)-new Date(b.date))
                .map(m=>{
                const h=TEAMS[m.h], a=TEAMS[m.a], done=m.hs!==null;
                return(
                  <div key={m.id} className={`mitem${m.live?' live-match':''}`}>
                    {m.live && <span className="live-badge">AO VIVO</span>}
                    <div className="mteam">
                      <Flag code={h.f} size="sm"/>
                      <span>{h.s}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,flexShrink:0}}>
                      <div className={`mscore${done?(m.live?' live':' done'):''}`}>
                        {done ? `${m.hs} – ${m.as}` : (m.date ? fmtDate(m.date) : '– : –')}
                      </div>
                      {m.city && <div style={{fontSize:10,color:'#2a4a68',letterSpacing:'0.3px',textAlign:'center',maxWidth:100,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>📍 {m.city}</div>}
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
                          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:pos<2?'#f0b429':'#3a5070'}}>{st?.pts??0}</span>
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

      {/* ════ MATA-MATA (100% via API) ════ */}
      {tab==='matamat' && <>
        <div className="korbar">
          {KO_VIEW.map(r=>(
            <button key={r.id} className={`krbtn${kr===r.id?' on':''}`} onClick={()=>setKr(r.id)}>{r.label}</button>
          ))}
        </div>

        {kr==='FINALS' && champ && (
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
          {koApi
            .filter(m => kr==='FINALS' ? (m.stage==='FINAL'||m.stage==='THIRD_PLACE') : m.stage===kr)
            .sort((a,b)=> kr==='FINALS'
              ? (a.stage==='FINAL'?-1:1)
              : new Date(a.date)-new Date(b.date))
            .map((m, i) => {
              const h = TEAMS[m.h], a = TEAMS[m.a];
              const decided = m.status === 'FINISHED' && m.winner;
              const apiWin =
                m.winner === 'HOME_TEAM' ? 'h' :
                m.winner === 'AWAY_TEAM' ? 'a' :
                (m.pen ? (m.pen.home > m.pen.away ? 'h' : 'a') : null);
              const pick = picks[m.id];
              const lbl = m.stage==='FINAL' ? '🏆 FINAL'
                : m.stage==='THIRD_PLACE' ? '🥉 3º LUGAR'
                : `${STAGE_NAMES[m.stage]} · Jogo ${i+1}`;

              const Slot = ({ side }) => {
                const team = side==='h' ? m.h : m.a;
                const td   = side==='h' ? h : a;
                const score= side==='h' ? m.hs : m.as;
                const isWin   = decided && apiWin === side;
                const isLose  = decided && apiWin && apiWin !== side;
                const isPick  = !decided && pick === side;
                const canPick = !decided && team;
                return (
                  <div
                    className={`koslot${isWin?' win':''}${isLose?' lose':''}${isPick?' pickd':''}${!canPick?' nd':''}`}
                    onClick={() => canPick && togglePick(m.id, side)}>
                    <Flag code={td?.f}/>
                    {td
                      ? <span className="koname">{td.n}</span>
                      : <span className="koname tbd">A definir</span>}
                    {(score !== null && score !== undefined) &&
                      <span className={`koscore${m.live?' live':''}`}>{score}{m.pen ? ` (${side==='h'?m.pen.home:m.pen.away})` : ''}</span>}
                    {isWin  && <span className="kotick">✓</span>}
                    {isPick && <span className="kopick">palpite</span>}
                  </div>
                );
              };

              return (
                <div key={m.id} className={`kocard${m.live?' live-card':''}`}>
                  <div className="kochdr">
                    {lbl}
                    {m.live && <span className="live-badge" style={{position:'static',marginLeft:8}}>AO VIVO</span>}
                  </div>
                  <Slot side="h"/>
                  <Slot side="a"/>
                  <div className="kofoot">📅 {fmtDate(m.date)} BRT</div>
                </div>
              );
            })}
          {koApi.length === 0 && (
            <div style={{gridColumn:'1/-1',textAlign:'center',padding:40,color:'#3a5a78',fontSize:14}}>
              Carregando confrontos do mata-mata...
            </div>
          )}
        </div>

        <div className="hint">
          💡 Confrontos e resultados 100% automáticos via FIFA/football-data ·
          Clique em uma seleção antes do jogo para registrar seu palpite
        </div>
      </>}

    </div>
  );
}
