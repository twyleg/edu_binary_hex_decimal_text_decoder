import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change "my-vite-app" to your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/edu_binary_hex_decimal_text_decoder/',
})
