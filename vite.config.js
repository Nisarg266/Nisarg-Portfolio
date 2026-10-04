import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    chunkSizeWarningLimit: 900
  },
  server: {
    watch: {
      ignored: ['**/*.mp4', '**/public/*.mp4']
    }
  }
})
