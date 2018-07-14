const path = require('path');
const querystring = require('querystring');
const config = require('config');
const Koa = require('koa');
const rp = require('request-promise-native');

const app = new Koa();
app.proxy = true;
app.use(require('koa-logger')());

app.use(require('./app-runner'));

app.use(require('koa-favicon')(path.join(__dirname, '../../public/favicon.ico')));

app.use(async (ctx, next) => {
  if (ctx.path === '/auth/github') {
    const query = querystring.stringify({
      client_id: config.get('GITHUB_CLIENT_ID'),
    });
    ctx.redirect(`https://github.com/login/oauth/authorize?${query}`);
  } else if (ctx.path === '/auth/github/callback') {
    const { code } = ctx.query;
    const body = await rp({
      uri: 'https://github.com/login/oauth/access_token',
      qs: {
        client_id: config.get('GITHUB_CLIENT_ID'),
        client_secret: config.get('GITHUB_CLIENT_SECRET'),
        code,
      },
    });
    ctx.redirect(`/#${body}`);
  } else {
    await next();
  }
});

if (process.env.NODE_ENV === 'production') {
  const root = path.join(__dirname, '../../build/client');
  app.use(async (ctx, next) => {
    if (ctx.path === '/' || ctx.path === '/index.html') {
      const ONE_MIN = 60 * 1000;
      await require('koa-send')(ctx, 'index.html', { root, maxage: ONE_MIN });
    } else {
      await next();
    }
  });
  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
  app.use(require('koa-static')(root, { maxage: ONE_YEAR, immutable: true }));
} else {
  const opts = {
    config: require('./webpack-dev-config'),
    hotClient: { port: 33102 },
  };
  (async () => {
    app.use(await require('koa-webpack')(opts));
  })();
}

const port = process.env.PORT || (process.env.NODE_ENV === 'production' && 33100) || 33101;
app.listen(port);
console.log('Listening on', port);
