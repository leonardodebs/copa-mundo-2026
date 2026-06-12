// Vercel Serverless Function — proxy para football-data.org
// Resolve o bloqueio de CORS: o navegador chama /api/matches (mesmo domínio)
// e esta function chama a API externa server-side com a chave protegida.

export default async function handler(req, res) {
  const key = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'no_key' });
  }

  try {
    const upstream = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      { headers: { 'X-Auth-Token': key } }
    );

    const data = await upstream.json();

    // Cache de 30s na edge do Vercel — protege o rate limit de 10 req/min
    // mesmo com muitos visitantes simultâneos
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
