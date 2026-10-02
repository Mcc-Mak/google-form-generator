import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 對應 GitHub Pages 子路徑（repo 名稱）
export default defineConfig({
  base: '/google-form-generator/',
  plugins: [react()],
})
