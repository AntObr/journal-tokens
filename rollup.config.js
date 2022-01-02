import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'module/main.mjs',
  output: {
    file: 'dist/journal-tokens.js',
    format: 'es'
  },
  plugins: [nodeResolve({preferBuiltins:false}), commonjs()]
};