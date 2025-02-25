// See: https://rollupjs.org/introduction/

import { defineConfig } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

export default defineConfig({
  input: {
    main: 'src/main.ts',
    post: 'src/post.ts'
  },
  output: {
    esModule: true,
    sourcemap: true,
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name]/index.js', // Places compiled files in `dist/main/index.js` and `dist/post/index.js`
    preserveModules: true
  },
  plugins: [
    typescript(),
    nodeResolve({ preferBuiltins: true }),
    json(),
    commonjs()
  ],
  context: 'this',
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') return // Suppress circular warnings
    warn(warning)
  }
})
