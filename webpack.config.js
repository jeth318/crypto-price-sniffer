import nodeExternals from 'webpack-node-externals';

export default {
  mode: 'production',
  target: 'node',
  entry: './src/main.js',
  externals: [nodeExternals()],
  output: {
    clean: true,
    filename: 'cps.js',
  },
  externalsPresets: {
    node: true,
  },
};
