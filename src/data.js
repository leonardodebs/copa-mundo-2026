export const TEAMS = {
  mex:{n:"México",        s:"MEX",f:"mx"},   rsa:{n:"África do Sul",  s:"RSA",f:"za"},
  kor:{n:"Coreia do Sul", s:"KOR",f:"kr"},   cze:{n:"Rep. Tcheca",    s:"CZE",f:"cz"},
  can:{n:"Canadá",        s:"CAN",f:"ca"},   bih:{n:"Bósnia-Herz.",   s:"BIH",f:"ba"},
  qat:{n:"Catar",         s:"QAT",f:"qa"},   sui:{n:"Suíça",          s:"SUI",f:"ch"},
  bra:{n:"Brasil",        s:"BRA",f:"br"},   mar:{n:"Marrocos",       s:"MAR",f:"ma"},
  hai:{n:"Haiti",         s:"HAI",f:"ht"},   sco:{n:"Escócia",        s:"SCO",f:"gb-sct"},
  usa:{n:"EUA",           s:"USA",f:"us"},   par:{n:"Paraguai",       s:"PAR",f:"py"},
  aus:{n:"Austrália",     s:"AUS",f:"au"},   tur:{n:"Turquia",        s:"TUR",f:"tr"},
  ger:{n:"Alemanha",      s:"GER",f:"de"},   cur:{n:"Curaçao",        s:"CUR",f:"cw"},
  civ:{n:"C. do Marfim",  s:"CIV",f:"ci"},   ecu:{n:"Equador",        s:"ECU",f:"ec"},
  ned:{n:"Holanda",       s:"NED",f:"nl"},   jpn:{n:"Japão",          s:"JPN",f:"jp"},
  swe:{n:"Suécia",        s:"SWE",f:"se"},   tun:{n:"Tunísia",        s:"TUN",f:"tn"},
  bel:{n:"Bélgica",       s:"BEL",f:"be"},   egy:{n:"Egito",          s:"EGY",f:"eg"},
  irn:{n:"Irã",           s:"IRN",f:"ir"},   nzl:{n:"Nova Zelândia",  s:"NZL",f:"nz"},
  esp:{n:"Espanha",       s:"ESP",f:"es"},   cpv:{n:"Cabo Verde",     s:"CPV",f:"cv"},
  ksa:{n:"Arábia Saudita",s:"KSA",f:"sa"},   uru:{n:"Uruguai",        s:"URU",f:"uy"},
  fra:{n:"França",        s:"FRA",f:"fr"},   sen:{n:"Senegal",        s:"SEN",f:"sn"},
  irq:{n:"Iraque",        s:"IRQ",f:"iq"},   nor:{n:"Noruega",        s:"NOR",f:"no"},
  arg:{n:"Argentina",     s:"ARG",f:"ar"},   alg:{n:"Argélia",        s:"ALG",f:"dz"},
  aut:{n:"Áustria",       s:"AUT",f:"at"},   jor:{n:"Jordânia",       s:"JOR",f:"jo"},
  por:{n:"Portugal",      s:"POR",f:"pt"},   cod:{n:"RD Congo",       s:"COD",f:"cd"},
  uzb:{n:"Uzbequistão",   s:"UZB",f:"uz"},   col:{n:"Colômbia",       s:"COL",f:"co"},
  eng:{n:"Inglaterra",    s:"ENG",f:"gb-eng"},cro:{n:"Croácia",       s:"CRO",f:"hr"},
  pan:{n:"Panamá",        s:"PAN",f:"pa"},   gha:{n:"Gana",           s:"GHA",f:"gh"},
};

export const GROUPS = {
  A:["mex","rsa","kor","cze"], B:["can","bih","qat","sui"],
  C:["bra","mar","hai","sco"], D:["usa","par","aus","tur"],
  E:["ger","cur","civ","ecu"], F:["ned","jpn","swe","tun"],
  G:["bel","egy","irn","nzl"], H:["esp","cpv","ksa","uru"],
  I:["fra","sen","irq","nor"], J:["arg","alg","aut","jor"],
  K:["por","cod","uzb","col"], L:["eng","cro","pan","gha"],
};
export const GK = Object.keys(GROUPS);
export const BUILD_TS = "2026-05-22T00:00Z";

// Calendário oficial FIFA — horários em UTC (BRT = UTC-3)
// Fonte: FIFA / Trivela (maio 2026)
export const SCHEDULE = {
  // ── GRUPO A ──────────────────────────────────────────
  'A:mex-rsa': { d:'2026-06-11T19:00:00Z', c:'Cidade do México' }, // 16h BRT
  'A:cze-kor': { d:'2026-06-12T02:00:00Z', c:'Guadalajara'       }, // 23h BRT 11/06
  'A:cze-rsa': { d:'2026-06-18T16:00:00Z', c:'Atlanta'           }, // 13h BRT
  'A:kor-mex': { d:'2026-06-19T01:00:00Z', c:'Guadalajara'       }, // 22h BRT 18/06
  'A:cze-mex': { d:'2026-06-25T01:00:00Z', c:'Cidade do México'  }, // 22h BRT 24/06
  'A:kor-rsa': { d:'2026-06-25T01:00:00Z', c:'Monterrey'         }, // 22h BRT 24/06
  // ── GRUPO B ──────────────────────────────────────────
  'B:bih-can': { d:'2026-06-12T19:00:00Z', c:'Toronto'           }, // 16h BRT
  'B:qat-sui': { d:'2026-06-13T19:00:00Z', c:'São Francisco'     }, // 16h BRT
  'B:bih-sui': { d:'2026-06-18T19:00:00Z', c:'Los Angeles'       }, // 16h BRT
  'B:can-qat': { d:'2026-06-18T22:00:00Z', c:'Vancouver'         }, // 19h BRT
  'B:can-sui': { d:'2026-06-24T19:00:00Z', c:'Vancouver'         }, // 16h BRT
  'B:bih-qat': { d:'2026-06-24T19:00:00Z', c:'Seattle'           }, // 16h BRT
  // ── GRUPO C ──────────────────────────────────────────
  'C:bra-mar': { d:'2026-06-13T22:00:00Z', c:'Nova York'         }, // 19h BRT
  'C:hai-sco': { d:'2026-06-14T01:00:00Z', c:'Boston'            }, // 22h BRT 13/06
  'C:mar-sco': { d:'2026-06-19T22:00:00Z', c:'Boston'            }, // 19h BRT
  'C:bra-hai': { d:'2026-06-20T01:00:00Z', c:'Filadélfia'        }, // 22h BRT 19/06
  'C:bra-sco': { d:'2026-06-24T22:00:00Z', c:'Miami'             }, // 19h BRT
  'C:hai-mar': { d:'2026-06-24T22:00:00Z', c:'Atlanta'           }, // 19h BRT
  // ── GRUPO D ──────────────────────────────────────────
  'D:par-usa': { d:'2026-06-13T01:00:00Z', c:'Los Angeles'       }, // 22h BRT 12/06
  'D:aus-tur': { d:'2026-06-13T04:00:00Z', c:'Vancouver'         }, // 01h BRT
  'D:par-tur': { d:'2026-06-19T04:00:00Z', c:'São Francisco'     }, // 01h BRT
  'D:aus-usa': { d:'2026-06-19T19:00:00Z', c:'Seattle'           }, // 16h BRT
  'D:tur-usa': { d:'2026-06-25T19:00:00Z', c:'Dallas'            }, // 16h BRT
  'D:aus-par': { d:'2026-06-25T19:00:00Z', c:'Kansas City'       }, // 16h BRT
  // ── GRUPO E ──────────────────────────────────────────
  'E:cur-ger': { d:'2026-06-14T17:00:00Z', c:'Houston'           }, // 14h BRT
  'E:civ-ecu': { d:'2026-06-14T23:00:00Z', c:'Filadélfia'        }, // 20h BRT
  'E:civ-ger': { d:'2026-06-20T20:00:00Z', c:'Toronto'           }, // 17h BRT
  'E:cur-ecu': { d:'2026-06-21T00:00:00Z', c:'Kansas City'       }, // 21h BRT 20/06
  'E:ecu-ger': { d:'2026-06-25T22:00:00Z', c:'Los Angeles'       }, // 19h BRT
  'E:civ-cur': { d:'2026-06-25T22:00:00Z', c:'Boston'            }, // 19h BRT
  // ── GRUPO F ──────────────────────────────────────────
  'F:jpn-ned': { d:'2026-06-14T20:00:00Z', c:'Dallas'            }, // 17h BRT
  'F:swe-tun': { d:'2026-06-15T02:00:00Z', c:'Monterrey'         }, // 23h BRT 14/06
  'F:jpn-tun': { d:'2026-06-20T04:00:00Z', c:'Monterrey'         }, // 01h BRT
  'F:ned-swe': { d:'2026-06-20T17:00:00Z', c:'Houston'           }, // 14h BRT
  'F:ned-tun': { d:'2026-06-26T01:00:00Z', c:'Miami'             }, // 22h BRT 25/06
  'F:jpn-swe': { d:'2026-06-26T01:00:00Z', c:'Seattle'           }, // 22h BRT 25/06
  // ── GRUPO G ──────────────────────────────────────────
  'G:bel-egy': { d:'2026-06-15T19:00:00Z', c:'Seattle'           }, // 16h BRT
  'G:irn-nzl': { d:'2026-06-16T01:00:00Z', c:'Los Angeles'       }, // 22h BRT 15/06
  'G:bel-irn': { d:'2026-06-21T19:00:00Z', c:'Los Angeles'       }, // 16h BRT
  'G:egy-nzl': { d:'2026-06-22T01:00:00Z', c:'Vancouver'         }, // 22h BRT 21/06
  'G:bel-nzl': { d:'2026-06-26T19:00:00Z', c:'Houston'           }, // 16h BRT
  'G:egy-irn': { d:'2026-06-26T19:00:00Z', c:'Dallas'            }, // 16h BRT
  // ── GRUPO H ──────────────────────────────────────────
  'H:cpv-esp': { d:'2026-06-15T16:00:00Z', c:'Atlanta'           }, // 13h BRT
  'H:ksa-uru': { d:'2026-06-15T22:00:00Z', c:'Miami'             }, // 19h BRT
  'H:esp-ksa': { d:'2026-06-21T16:00:00Z', c:'Atlanta'           }, // 13h BRT
  'H:cpv-uru': { d:'2026-06-21T22:00:00Z', c:'Miami'             }, // 19h BRT
  'H:esp-uru': { d:'2026-06-26T22:00:00Z', c:'Nova York'         }, // 19h BRT
  'H:cpv-ksa': { d:'2026-06-26T22:00:00Z', c:'Los Angeles'       }, // 19h BRT
  // ── GRUPO I ──────────────────────────────────────────
  'I:fra-sen': { d:'2026-06-16T19:00:00Z', c:'Nova York'         }, // 16h BRT
  'I:irq-nor': { d:'2026-06-16T22:00:00Z', c:'Boston'            }, // 19h BRT
  'I:fra-irq': { d:'2026-06-22T21:00:00Z', c:'Filadélfia'        }, // 18h BRT
  'I:nor-sen': { d:'2026-06-23T00:00:00Z', c:'Nova York'         }, // 21h BRT 22/06
  'I:fra-nor': { d:'2026-06-27T16:00:00Z', c:'Kansas City'       }, // 13h BRT
  'I:irq-sen': { d:'2026-06-27T16:00:00Z', c:'Atlanta'           }, // 13h BRT
  // ── GRUPO J ──────────────────────────────────────────
  'J:aut-jor': { d:'2026-06-16T04:00:00Z', c:'São Francisco'     }, // 01h BRT
  'J:alg-arg': { d:'2026-06-17T01:00:00Z', c:'Kansas City'       }, // 22h BRT 16/06
  'J:alg-jor': { d:'2026-06-22T03:00:00Z', c:'São Francisco'     }, // 00h BRT 22/06
  'J:arg-aut': { d:'2026-06-22T17:00:00Z', c:'Dallas'            }, // 14h BRT
  'J:arg-jor': { d:'2026-06-27T19:00:00Z', c:'Houston'           }, // 16h BRT
  'J:alg-aut': { d:'2026-06-27T19:00:00Z', c:'San José'          }, // 16h BRT
  // ── GRUPO K ──────────────────────────────────────────
  'K:cod-por': { d:'2026-06-17T17:00:00Z', c:'Houston'           }, // 14h BRT
  'K:col-uzb': { d:'2026-06-18T02:00:00Z', c:'Cidade do México'  }, // 23h BRT 17/06
  'K:por-uzb': { d:'2026-06-23T17:00:00Z', c:'Houston'           }, // 14h BRT
  'K:cod-col': { d:'2026-06-24T02:00:00Z', c:'Guadalajara'       }, // 23h BRT 23/06
  'K:col-por': { d:'2026-06-27T22:00:00Z', c:'Dallas'            }, // 19h BRT
  'K:cod-uzb': { d:'2026-06-27T22:00:00Z', c:'Toronto'           }, // 19h BRT
  // ── GRUPO L ──────────────────────────────────────────
  'L:cro-eng': { d:'2026-06-17T20:00:00Z', c:'Dallas'            }, // 17h BRT
  'L:gha-pan': { d:'2026-06-17T23:00:00Z', c:'Toronto'           }, // 20h BRT
  'L:eng-gha': { d:'2026-06-23T20:00:00Z', c:'Boston'            }, // 17h BRT
  'L:cro-pan': { d:'2026-06-23T23:00:00Z', c:'Toronto'           }, // 20h BRT
  'L:eng-pan': { d:'2026-06-28T01:00:00Z', c:'Miami'             }, // 22h BRT 27/06
  'L:cro-gha': { d:'2026-06-28T01:00:00Z', c:'Vancouver'         }, // 22h BRT 27/06
};

// Map football-data.org TLA → nosso ID
export const TLA_MAP = {
  MEX:"mex",ZAF:"rsa",KOR:"kor",CZE:"cze",
  CAN:"can",BIH:"bih",QAT:"qat",SUI:"sui",
  BRA:"bra",MAR:"mar",HAI:"hai",SCO:"sco",
  USA:"usa",PAR:"par",AUS:"aus",TUR:"tur",
  GER:"ger",CUW:"cur",CIV:"civ",ECU:"ecu",
  NED:"ned",JPN:"jpn",SWE:"swe",TUN:"tun",
  BEL:"bel",EGY:"egy",IRN:"irn",NZL:"nzl",
  ESP:"esp",CPV:"cpv",KSA:"ksa",URU:"uru",
  FRA:"fra",SEN:"sen",IRQ:"irq",NOR:"nor",
  ARG:"arg",ALG:"alg",AUT:"aut",JOR:"jor",
  POR:"por",COD:"cod",UZB:"uzb",COL:"col",
  ENG:"eng",CRO:"cro",PAN:"pan",GHA:"gha",
  RSA:"rsa",URY:"uru",CZE:"cze",
};

export const R32_SRC = [
  [{g:"A",p:0},{g:"B",p:1}],[{g:"C",p:0},{g:"D",p:1}],
  [{g:"E",p:0},{g:"F",p:1}],[{g:"G",p:0},{g:"H",p:1}],
  [{g:"I",p:0},{g:"J",p:1}],[{g:"K",p:0},{g:"L",p:1}],
  [{g:"B",p:0},{g:"A",p:1}],[{g:"D",p:0},{g:"C",p:1}],
  [{g:"F",p:0},{g:"E",p:1}],[{g:"H",p:0},{g:"G",p:1}],
  [{g:"J",p:0},{g:"I",p:1}],[{g:"L",p:0},{g:"K",p:1}],
  [{lbl:"3º A/C/E"},{lbl:"3º G/I/K"}],
  [{lbl:"3º B/D/F"},{lbl:"3º H/J/L"}],
  [{lbl:"3º A/B/C"},{lbl:"3º D/E/F"}],
  [{lbl:"3º G/H/I"},{lbl:"3º J/K/L"}],
];

export const KO_ROUNDS = [
  {id:"r32",    label:"32-avos",     matches:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]},
  {id:"oitavas",label:"Oitavas",     matches:[16,17,18,19,20,21,22,23]},
  {id:"quartas",label:"Quartas",     matches:[24,25,26,27]},
  {id:"semis",  label:"Semifinais",  matches:[28,29]},
  {id:"final",  label:"Final & 3º", matches:[31,30]},
];

export function initGroupMatches() {
  const all = {};
  Object.entries(GROUPS).forEach(([g,teams]) => {
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
      const [a,b] = [teams[i],teams[j]].sort();
      const id = `${g}:${a}-${b}`;
      const sched = SCHEDULE[id] || {};
      all[id] = {
        id, g,
        h: teams[i], a: teams[j],
        hs: null, as: null,
        status: 'SCHEDULED',
        live: false,
        date: sched.d || null,
        city: sched.c || null,
      };
    }
  });
  return all;
}

export function calcStandings(g,matches){
  const st={};
  GROUPS[g].forEach(t=>st[t]={id:t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  Object.values(matches).filter(m=>m.g===g&&m.hs!==null).forEach(({h,a,hs,as})=>{
    st[h].p++;st[a].p++;
    st[h].gf+=hs;st[h].ga+=as;
    st[a].gf+=as;st[a].ga+=hs;
    if(hs>as){st[h].w++;st[h].pts+=3;st[a].l++;}
    else if(hs<as){st[a].w++;st[a].pts+=3;st[h].l++;}
    else{st[h].d++;st[a].d++;st[h].pts++;st[a].pts++;}
  });
  return Object.values(st).sort((a,b)=>
    b.pts-a.pts||((b.gf-b.ga)-(a.gf-a.ga))||b.gf-a.gf
  );
}

export function getSlotTeam(src,allS,doneGroups){
  if(!src) return null;
  if(src.lbl) return src;
  if(src.g!==undefined){
    // Só revela a seleção quando TODOS os jogos do grupo terminaram.
    // Antes disso, mostra a vaga ("1º Grupo A") para não exibir confrontos falsos.
    if(!doneGroups || !doneGroups.has(src.g)){
      return {lbl:`${src.p+1}º Grupo ${src.g}`};
    }
    const s=allS[src.g];return s&&s[src.p]?s[src.p].id:null;
  }
  return null;
}

export function getMatchTeams(idx,koW,allS,doneGroups){
  if(idx<16){const[s0,s1]=R32_SRC[idx];return[getSlotTeam(s0,allS,doneGroups),getSlotTeam(s1,allS,doneGroups)];}
  if(idx<24){const b=(idx-16)*2;return[koW[b]||null,koW[b+1]||null];}
  if(idx<28){const b=(idx-24)*2+16;return[koW[b]||null,koW[b+1]||null];}
  if(idx<30){const b=(idx-28)*2+24;return[koW[b]||null,koW[b+1]||null];}
  if(idx===30){
    const[h28,a28]=getMatchTeams(28,koW,allS);
    const[h29,a29]=getMatchTeams(29,koW,allS);
    return[koW[28]?(koW[28]===h28?a28:h28):null,koW[29]?(koW[29]===h29?a29:h29):null];
  }
  return[koW[28]||null,koW[29]||null];
}
// Calendário oficial mata-mata — datas/locais por posição no bracket
// índice: 0-15 = 32-avos, 16-23 = Oitavas, 24-27 = Quartas, 28-29 = Semis, 30 = 3º, 31 = Final
export const KO_SCHEDULE = {
  // ── 32-AVOS DE FINAL (28/jun – 3/jul) ────────────────────────────────────
  0:  { d:'28/jun', t:'13h', c:'Dallas'             },
  1:  { d:'28/jun', t:'17h', c:'Miami'              },
  2:  { d:'29/jun', t:'13h', c:'Atlanta'            },
  3:  { d:'29/jun', t:'17h', c:'Seattle'            },
  4:  { d:'30/jun', t:'13h', c:'Kansas City'        },
  5:  { d:'30/jun', t:'17h', c:'Los Angeles'        },
  6:  { d:'1/jul',  t:'13h', c:'Boston'             },
  7:  { d:'1/jul',  t:'17h', c:'Filadélfia'         },
  8:  { d:'2/jul',  t:'13h', c:'Houston'            },
  9:  { d:'2/jul',  t:'17h', c:'Nova York'          },
  10: { d:'2/jul',  t:'20h', c:'Vancouver'          },
  11: { d:'3/jul',  t:'13h', c:'Toronto'            },
  12: { d:'3/jul',  t:'17h', c:'Guadalajara'        },
  13: { d:'3/jul',  t:'20h', c:'San Francisco'      },
  14: { d:'3/jul',  t:'22h', c:'Cidade do México'   },
  15: { d:'3/jul',  t:'22h', c:'Monterrey'          },
  // ── OITAVAS DE FINAL (4–7/jul) ───────────────────────────────────────────
  16: { d:'4/jul',  t:'17h', c:'Dallas'             },
  17: { d:'4/jul',  t:'20h', c:'Miami'              },
  18: { d:'5/jul',  t:'17h', c:'Los Angeles'        },
  19: { d:'5/jul',  t:'20h', c:'Seattle'            },
  20: { d:'6/jul',  t:'17h', c:'Nova York'          },
  21: { d:'6/jul',  t:'20h', c:'Kansas City'        },
  22: { d:'7/jul',  t:'17h', c:'Atlanta'            },
  23: { d:'7/jul',  t:'20h', c:'Houston'            },
  // ── QUARTAS DE FINAL (8 e 11/jul) ────────────────────────────────────────
  24: { d:'8/jul',  t:'17h', c:'Los Angeles'        },
  25: { d:'8/jul',  t:'20h', c:'Nova York'          },
  26: { d:'11/jul', t:'17h', c:'Seattle'            },
  27: { d:'11/jul', t:'20h', c:'Miami'              },
  // ── SEMIFINAIS (14 e 15/jul) ─────────────────────────────────────────────
  28: { d:'14/jul', t:'20h', c:'Dallas'             },
  29: { d:'15/jul', t:'20h', c:'Los Angeles'        },
  // ── 3º LUGAR (18/jul) ────────────────────────────────────────────────────
  30: { d:'18/jul', t:'16h', c:'Hard Rock Stadium – Miami' },
  // ── FINAL (19/jul) ───────────────────────────────────────────────────────
  31: { d:'19/jul', t:'16h', c:'MetLife Stadium – New Jersey' },
};
