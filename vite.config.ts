import { resolve } from 'path'

// https://vitejs.dev/config/
export default {
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src'),
      },
    ],
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vue-compositions',
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}