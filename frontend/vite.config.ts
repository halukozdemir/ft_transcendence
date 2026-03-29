import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hmrHost = env.VITE_HMR_HOST
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || '8443')

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',
      port: 80,
      strictPort: true,
      hmr: {
        protocol: 'wss',
        ...(hmrHost ? { host: hmrHost } : {}),
        clientPort: hmrClientPort,
        path: '/__vite_hmr',
      },
    },
  }
})