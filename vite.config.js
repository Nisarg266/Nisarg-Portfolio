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
      // Static assets don't need HMR watching, and OneDrive-synced media/
      // documents can be locked mid-sync or open in another app — watching
      // them crashes the watcher with EBUSY, so they are excluded here.
      ignored: ['**/*.mp4', '**/public', '**/public/**']
    }
  }
})
