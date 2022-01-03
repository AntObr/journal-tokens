import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.mjs',
  output: {
    file: 'module/journal-tokens.js',
    format: 'es'
  },
  plugins: [nodeResolve({preferBuiltins:false}), commonjs()]
};