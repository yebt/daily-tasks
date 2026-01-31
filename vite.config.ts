import { fileURLToPath, URL } from 'node:url'

import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const aliases: Record<string, string> = {
  '@': './src',
  '@core': './src/core',
  '@shared': './src/shared',
  '@modules': './src/modules',
}

const alias = Object.entries(aliases).reduce((acc: Record<string, string>, [aKey, aVal]) => {
  acc[aKey] = fileURLToPath(new URL(aVal, import.meta.url))
  return acc
}, {})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnoCSS(),
    vue(),
    vueDevTools({
      // # export LAUNCH_EDITOR=nvsr
      // launchEditor: 'nvsr'
    }),
  ],
  resolve: {
    alias,
    // alias: {
    //   '@': fileURLToPath(new URL('./src', import.meta.url)),
    // },
  },
})
