import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
import tailwindcss from '@tailwindcss/vite'
import { Server } from 'node:http'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
    server: {
      cors: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          //so that instead of calling the whole api(localhost...) we can call the api with the path (/api/)
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [tailwindcss()],
  }),
)
