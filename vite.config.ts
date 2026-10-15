import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' + singlefile: the built index.html is self-contained and loaded
// by Electron via loadFile.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
