
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Correção para __dirname em módulos ES (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: './', // Força caminhos relativos no build (evita 404 em diferentes hosts)
  resolve: {
    alias: {
      // Define @ como a raiz do projeto
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    host: true, // Permite acesso via IP na rede local
  },
  define: {
    // Exibição simples da versão vinda do package.json
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version)
  },
  build: {
    minify: false
  }
});
