import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  base: './',
  build: {
    outDir: 'dist-renderer',
  },
  server: {
    port: 5180,
    strictPort: true,
  },
})
