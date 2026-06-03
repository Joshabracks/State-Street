import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

// Bundles the compiled default-export entry (build/global.js) into a single
// minified UMD file that defines the global `State` when loaded via <script>.
// Run after `tsc` (see the build:umd npm script).
export default {
  input: 'build/global.js',
  output: {
    file: 'build/state-street.global.js',
    format: 'umd',
    name: 'State',
    exports: 'default',
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), terser()],
}
