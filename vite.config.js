import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// process.env está disponível no Node durante o build do Vercel
const FOOTBALL_API_KEY = process.env.VITE_FOOTBALL_API_KEY || ''

export default defineConfig({
  plugins: [react()],
  base: '/',
  // Força injeção da API key no bundle via define (bypass do cache do import.meta.env)
  define: {
    __FOOTBALL_API_KEY__: JSON.stringify(FOOTBALL_API_KEY),
  },
})
