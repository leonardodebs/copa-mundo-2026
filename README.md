# ⚽ Copa do Mundo 2026

Tabela interativa da Copa do Mundo FIFA 2026 com resultados automáticos.

**[→ Ver online](https://copa-mundo-2026.vercel.app)**

## Funcionalidades

- 🏳️ Todos os 12 grupos com as 48 seleções e bandeiras
- 📊 Classificação ao vivo calculada automaticamente
- 🔴 Indicador de jogo ao vivo
- 🏆 Chave do mata-mata (32-avos → Final)
- 🔄 Atualização automática via API (60s em jogos ao vivo, 5min fora)
- ✏️ Edição manual de placares como fallback

## Resultados Automáticos

1. Crie uma conta gratuita em [football-data.org](https://www.football-data.org/client/register)
2. Copie sua API key
3. No Vercel: **Settings → Environment Variables → Add** `VITE_FOOTBALL_API_KEY = sua_chave`
4. Redeploy

## Tecnologias

- React 18 + Vite
- [flag-icons](https://github.com/lipis/flag-icons) — bandeiras SVG
- [football-data.org](https://www.football-data.org) — API gratuita de futebol

## Desenvolvimento local

```bash
cp .env.example .env
# preencha VITE_FOOTBALL_API_KEY
npm install
npm run dev
```
