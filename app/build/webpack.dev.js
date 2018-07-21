const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const ChromeExtensionReloader = require('wcer');
const baseWebpack = require('./webpack.base');
const { styleLoaders } = require('./tools');


const rootDir = path.resolve(__dirname, '..');


module.exports = merge(baseWebpack, {
  watch: true,
  module: {
    rules: [
      ...styleLoaders({ sourceMap: false }),
    ],
  },
  devtool: '#cheap-module-source-map',
  plugins: [
    new ChromeExtensionReloader({
      port: 9090,
      manifest: path.join(rootDir, 'src', 'manifest.js'),
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
    new FriendlyErrorsPlugin(),
  ],
});