import 'babel-polyfill';
import path from 'path';
import debug from 'debug';

import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import koaMount from 'koa-mount';
import convert from 'koa-convert';
import bodyparser from 'koa-bodyparser';
import koaQs from 'koa-qs';
import session from 'koa-generic-session';
import SessionRedis from 'koa-redis';
// import send from 'koa-send';

import Config from './config';
import passport from './auth';

import routesHome from './routes/home';
import routesUsers from './routes/users';
import routesUser from './routes/user';
import routesLandscapes from './routes/landscapes';
import routesLandscape from './routes/landscape';
import routesExternal from './routes/external';
import routesInternal from './routes/internal';

const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  debug.enable('dev,koa');
}

const config = new Config();
const server = new Koa();

server.keys = [ 'nbusr123' ];

server.use(async (ctx, next) => {
  try {
    await next(); // next is now a function
  } catch (err) {
    debug('koa')(`Catched error ${err}`);
    ctx.body = { error: err.message !== undefined ? err.message : err };
    ctx.status = err.status || 500;
  }
});

server.use(convert(session({
  key: 'clr',
  prefix: 'session:',
  rolling: true,
  cookie: {
    maxAge: 1000 * 60
  },
  store: new SessionRedis({
    host: config.redisUrl,
    port: config.redisPort,
    auth_pass: config.redisPassword
  })
})));

// server.proxy = true;

server.use(passport.initialize());
server.use(passport.session());

koaQs(server, 'first');

// app.use(compress());
server.use(logger());
server.use(bodyparser());

// Router
const publicRouter = new Router();

publicRouter.post('/login', async (ctx, next) => {
  await passport.authenticate('local', async (user, info, status) => {
    const ret = {
      version: config.versionStr
    };
    if (typeof user === 'string') {
      if (info !== undefined && info.message !== undefined) {
        ret.error = info.message;
        ret.errorStatus = status;
      } else {
        ret.error = user;
      }
      ctx.body = ret;
      await ctx.logout();
    } else {
      ret.user = { ...user };
      ctx.body = ret;
      await ctx.login(user);
    }
  })(ctx, next);
});

publicRouter.get('/logout', async (ctx) => {
  const ret = {
    version: config.versionStr
  };
  await ctx.logout();
  ctx.body = ret;
});

/*
publicRouter.post('/login', passport.authenticate(
  'local',
  {
    successRedirect: '/',
    failureRedirect: '/failure'
  }
));
*/
/*
const publicFiles = [
  '/',
  '/index.html',
  '/Component.js',
  '/manifest.json',
  '/style.css',
  '/view/App.view.js',
  '/controller/App.controller.js',
  '/controller/BaseController.js',
  '/view/Login.view.js',
  '/view/Login.fragment.js',
  '/controller/Login.controller.js'
];

publicFiles.forEach((file) => {
  publicRouter.get(file, async (ctx) => {
    await send(
      ctx,
      (file === '/' ? 'index.html' : file),
      { root: path.resolve(__dirname, 'public') }
    );
  });
});
*/

async function authed(ctx, next) {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    /*
    const ret = {
      version: config.versionStr,
      error: 'Not authenticated'
    };
    */
    ctx.status = 401;
    ctx.body = 'Not authenticated';
  }
}

async function authedAsAdmin(ctx, next) {
  if (ctx.isAuthenticated() &&
    ctx.passport.user &&
    ctx.passport.user.isAdmin === 'true') {
    await next();
  } else {
    ctx.status = 401;
    ctx.body = 'Not authenticated';
  }
}

const securedRouter = new Router();
/*
securedRouter.get('/app', authed, (ctx) => {
  ctx.body = `Secured Zone: koa-tutorial\n${JSON.stringify(ctx.req.user, null, '\t')}`;
});
*/
securedRouter.use('/home', authed,
  routesHome.routes(), routesHome.allowedMethods()
);
securedRouter.use('/users', authedAsAdmin,
  routesUsers.routes(), routesUsers.allowedMethods()
);
securedRouter.use('/user', authedAsAdmin,
  routesUser.routes(), routesUser.allowedMethods()
);
securedRouter.use('/landscapes', authedAsAdmin,
  routesLandscapes.routes(), routesLandscapes.allowedMethods()
);
securedRouter.use('/landscape', authedAsAdmin,
  routesLandscape.routes(), routesLandscape.allowedMethods()
);
securedRouter.use('/landscape', authedAsAdmin,
  routesExternal.routes(), routesExternal.allowedMethods()
);
securedRouter.use('/landscape', authedAsAdmin,
  routesInternal.routes(), routesInternal.allowedMethods()
);

server.use(publicRouter.routes());
server.use(securedRouter.routes());
server.use(publicRouter.allowedMethods());
server.use(securedRouter.allowedMethods());

/*
server.use(convert(koaMount('/i18n', koaStatic(path.join(__dirname, 'public/i18n')))));
*/

server.use(koaMount(
  '/',
  koaStatic(path.join(__dirname, 'public'))
));

server.use(koaMount(
  '/resources',
  koaStatic(path.join(__dirname, 'ui5'))
));

/*
server.use(async (ctx, next) => {
  if (ctx.request.url.includes('i18n')
  || ctx.request.url.includes('favicon.ico')
  || ctx.request.url.includes('Component-preload.js')
  || ctx.request.url.includes('.png')
  || ctx.request.url.includes('.properties')) {
    await next();
  } else if (ctx.method === 'GET') {
    debug('koa')(`Redirecting ${ctx.path} to /`);
    await ctx.redirect('/');
  }
});
*/
server.listen(config.port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://${config.host}/`);
});
