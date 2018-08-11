const path = require('path');
const fs = require('fs');
const memfs = require('memfs');
const linkfs = require('linkfs');
const unionfs = require('unionfs');
const unzipper = require('unzipper');
const request = require('request');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LRU = require('lru-cache');

const nodeModulesDir = path.join(__dirname, '../../node_modules');
const nodeModulesFs = linkfs.link(fs, [nodeModulesDir, nodeModulesDir]);

const patchVol = (vol) => {
  vol.join = (...args) => path.join(...args);
};

const volCache = LRU(20); // key = github-zip-url, value = fs-like-volume

const createWebpackConfig = () => ({
  context: '/',
  mode: 'production',
  entry: [
    '/index.js',
  ],
  output: {
    filename: '[hash]-index.js',
    chunkFilename: '[chunkhash]-chunk.js',
    path: '/build',
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `${nodeModulesDir}/raw-loader!/index.html`,
    }),
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: `${nodeModulesDir}/babel-loader`,
        options: {
          presets: [
            [`${nodeModulesDir}/@babel/preset-env`, { modules: false }],
            `${nodeModulesDir}/@babel/preset-react`,
          ],
          plugins: [
            `${nodeModulesDir}/@babel/plugin-transform-runtime`,
            `${nodeModulesDir}/@babel/plugin-proposal-object-rest-spread`,
            `${nodeModulesDir}/@babel/plugin-syntax-dynamic-import`,
          ],
        },
      }],
    }, {
      test: /\.(png|gif|jpg|svg)$/,
      use: [{
        loader: `${nodeModulesDir}/file-loader`,
        options: { name: '[hash]-[name].[ext]' },
      }],
    }],
  },
  resolve: {
    modules: [nodeModulesDir],
    extensions: ['.js', '.jsx'],
  },
});

const runWebpack = vol => new Promise((resolve, reject) => {
  const compiler = webpack(createWebpackConfig());
  compiler.inputFileSystem = vol;
  compiler.outputFileSystem = vol;
  compiler.resolvers.normal.fileSystem = vol;
  compiler.resolvers.context.fileSystem = vol;
  compiler.resolvers.loader.fileSystem = vol;
  compiler.run((err, stats) => {
    if (err) {
      reject(err);
    } else {
      resolve(stats);
    }
  });
});

const buildVol = async (url) => {
  if (volCache.has(url)) return volCache.get(url);
  const memVol = new memfs.Volume();
  const vol = new unionfs.Union();
  vol.use(memVol).use(nodeModulesFs);
  patchVol(vol);
  await request(url)
    .pipe(unzipper.Parse())
    .on('entry', async (entry) => {
      const index = entry.path.indexOf('/');
      const filePath = entry.path.slice(index); // strip the first directory
      if (entry.type === 'Directory') {
        vol.mkdirpSync(filePath);
      } else {
        const content = await entry.buffer();
        vol.writeFileSync(filePath, content);
      }
    })
    .promise();
  await runWebpack(vol);
  volCache.set(url, vol);
  return vol;
};

const parseHostname = (ctx) => {
  const match = /^([\w-]+)\.([\w-]+)\.([\w-]+)\.(limegreenjsapp\.axlight\.com|limegreenjs-\w+\.appspot\.com|localhost)/.exec(ctx.hostname);
  return match ? { owner: match[3], name: match[2], commit: match[1] } : {};
};

const ONE_DAY = 1 * 24 * 60 * 60;
const ONE_YEAR = 365 * 24 * 60 * 60;

const serveFile = (owner, name, commit) => async (ctx) => {
  const urlPath = ctx.path === '/' ? '/index.html' : ctx.path;
  const url = `https://github.com/${owner}/${name}/archive/${commit}.zip`;
  const vol = await buildVol(url);
  try {
    const content = vol.readFileSync(`/build${urlPath}`, 'utf-8');
    ctx.body = content;
    ctx.type = urlPath.split('.').pop();
    const cacheControl = urlPath === '/index.html'
      ? `public, max-age=${ONE_DAY}`
      : `public, max-age=${ONE_YEAR}, immutable`;
    ctx.set('Cache-Control', cacheControl);
  } catch (e) {
    console.log('unable to serve file in app-runner', e);
    ctx.status = 404;
  }
};

module.exports = async (ctx, next) => {
  const { owner, name, commit } = parseHostname(ctx);
  if (owner && name && commit) {
    await serveFile(owner, name, commit)(ctx);
  } else {
    await next();
  }
};
