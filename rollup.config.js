import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/server.ts',
  output: {
    interop: false,
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [typescript()]
};