import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        owner: fileURLToPath(new URL('./owner.html', import.meta.url)),
        privacidade: fileURLToPath(new URL('./privacidade.html', import.meta.url)),
        termos: fileURLToPath(new URL('./termos.html', import.meta.url)),
      },
    },
  },
})
