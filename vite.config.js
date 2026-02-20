import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    envDir: '../',
    server: {
        port: 3000,
        host: true,
        watch: {
            usePolling: true
        }
    }
})
