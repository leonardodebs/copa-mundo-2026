# ⚽ Copa do Mundo 2026

Tabela interativa da Copa do Mundo FIFA 2026 com resultados automáticos em tempo real.

**[→ Ver online](https://copa-mundo-2026.vercel.app)**

## Funcionalidades

- 🏳️ Todos os 12 grupos com as 48 seleções e bandeiras SVG
- 📊 Classificação ao vivo calculada automaticamente
- 🔴 Indicador de jogo ao vivo
- 🏆 Chave do mata-mata completa (32-avos → Final)
- 🔄 Atualização automática via API (60s em jogos ao vivo, 5min fora)
- ✏️ Edição manual de placares como fallback

## Stack

- **React 18 + Vite** — frontend
- **[flag-icons](https://github.com/lipis/flag-icons)** — bandeiras SVG
- **[football-data.org](https://www.football-data.org)** — API gratuita de resultados
- **Vercel** — deploy automático via GitHub

## Configuração

```bash
cp .env.example .env
# Preencha VITE_FOOTBALL_API_KEY com sua chave gratuita de football-data.org
npm install
npm run dev
```

## Deploy

Todo push no branch `main` gera um deploy automático no Vercel.

---
*Atualizado em: 2026-05-21 23:27 UTC*
