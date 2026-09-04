import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // '/' is right for a custom domain or a <user>.github.io site. If this ends up served
  // from a project page (<user>.github.io/website/), change this to '/website/' or asset
  // URLs will 404.
  base: '/'
})
