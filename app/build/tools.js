const { resolve } = require('path');
const { extract } = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const _  = require('lodash');


exports.htmlPage = (title, filename, chunks, template) => new HtmlWebpackPlugin({
  title,
  hash: true,
  cache: true,
  inject: 'body',
  filename: `./pages/${filename}.html`,
  template: template || resolve(__dirname, './page.ejs'),
  appMountId: 'app',
  chunks,
});

exports.cssLoaders = (options = {}) => {
  const loaders = {};
  const prePprocessors = {
    css: {},
    postcss: {},
    less: { loader: 'less' },
    sass: { loader: 'sass', options: { indentedSyntax: true } },
    scss: { loader: 'sass' },
    stylus: { loader: 'stylus' },
    styl: { loader: 'stylus' },
  };
  for (const key in prePprocessors) {
    const loader = [{
      loader: 'css-loader',
      options: { minimize: process.env.NODE_ENV === 'production' },
    }];
    if (prePprocessors[key].loader) {
      loader.push({
        loader: `${prePprocessors[key].loader}-loader`,
        options: Object.assign({}, prePprocessors[key].options, { sourceMap: options.sourceMap }),
      });
    }
    if (options.extract) {
      loaders[key] = extract({ use: loader, fallback: 'vue-style-loader' });
    } else {
      loaders[key] = ['vue-style-loader'].concat(loader);
    }
  }
  return loaders;
};

exports.styleLoaders = (options) => {
  const output = [];
  const loaders = exports.cssLoaders(options);
  for (const extension in loaders) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader,
    });
  }
  return output;
};

exports.chromeManifestToFox = (chromeManifest) => {
  const foxManifest = _.cloneDeep(chromeManifest);
  foxManifest.applications = {
    gecko: {
      id: `${chromeManifest.name}@${chromeManifest.author.replace(/[^a-z0-9-._]/ig, '_')}`,
    }
  };
  if ('background' in foxManifest && 'persistent' in foxManifest.background) {
    console.warn('background.persistent not supported Firefox');
    delete foxManifest.background.persistent;
  }
  if ('options_page' in foxManifest) {
    const option_page = foxManifest.options_page;
    delete foxManifest.options_page;
    foxManifest.options_ui = {
      page: option_page,
      open_in_tab: true,
      browser_style: true,
    };
  }
  if (foxManifest.permissions.includes('background')) {
    console.warn('background permission not supported Firefox');
    foxManifest.permissions = foxManifest.permissions.filter(x => x !== 'background');
  }
  return foxManifest;
};