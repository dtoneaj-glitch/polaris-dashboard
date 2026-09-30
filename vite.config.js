import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署於子路徑；本機開發維持根路徑
  base: process.env.GITHUB_ACTIONS ? '/polaris-dashboard/' : '/',
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
  },
})
