import 'babel-polyfill';
import path from 'path';
import moment from 'moment';
import Koa from 'koa';
import send from 'koa-send';
import logger from 'koa-logger';
import Router from 'koa-router';
import koaStatic from 'koa-static';
import koaMount from 'koa-mount';
import convert from 'koa-convert';
import body from 'koa-parse-json';
import debug from 'debug';
import { host, port, versionStr } from './config';
import Zabbix from './lib/zabbix';
import hosts from './zabbix/hosts';
import { servicesAsMap } from './zabbix/services';
import * as ZK from './zabbix/keys';
import items from './zabbix/items';
import Redis from './lib/redis';
import koaQs from 'koa-qs';

const { NODE_ENV } = process.env;
if (NODE_ENV === 'development') {
  debug.enable('dev,koa');
}

const server = new Koa();
koaQs(server, 'first');

const router = new Router();
const zabbix = new Zabbix();
const redis = new Redis();

// app.use(compress());
server.use(logger());

// uses async arrow functions
server.use(async (ctx, next) => {
  try {
    await next(); // next is now a function
  } catch (err) {
    ctx.body = { message: err.message };
    ctx.status = err.status || 500;
  }
});

router.post('/login', async (ctx) => {
  if (ctx.request.body === null || ctx.request.body.input === null) {
    ctx.body = {
      error: 'Wrong input'
    };
    return;
  }

  try {
    await redis.login();
  } catch (e) {
    ctx.body = {
      error: e
    };
    return;
  }

  const pass = await redis.getPassword();

  if (ctx.request.body.input !== pass) {
    ctx.body = {
      error: 'Wrong password'
    };
    return;
  }

  try {
    await redis.logout();
  } catch (e) {
    ctx.body = {
      error: e
    };
    return;
  }

  ctx.body = {
    version: versionStr,
    user: {
      id: 'admin',
      name: 'Administrator'
    }
  };
});

router.get('/Home', async ctx => {
  try {
    await redis.login();
  } catch (e) {
    ctx.body = {
      error: e
    };
    return;
  }

  const ls = await redis.getLandscapes();

  try {
    await redis.logout();
  } catch (e) {
    ctx.body = {
      error: e
    };
    return;
  }

  ctx.body = {
    version: versionStr,
    landscapes: ls.length
  };
});

router.get('/Landscapes', async ctx => {
  try {
    await redis.login();
  } catch (e) {
    ctx.body = {
      error: e
    };
    return;
  }

  // Retrieve DB info
  const ls = await redis.getLandscapes();

  try {
    await redis.logout();
  } catch (e) {
    ctx.body = {
      error: e
    };
    return;
  }

  // Retrieve Zabbix info

  ctx.body = {
    version: versionStr,
    landscapes: ls
  };
});

router.get('/Hosts', async ctx => {
  const hostsRet = {
    version: versionStr
  };

  if (ctx.request.body === null || ctx.request.body.id === null) {
    hostsRet.error = 'Wrong input';
    ctx.body = hostsRet;
    return;
  }

  try {
    // const zabbixUrl = ls.zabbix;
    await zabbix.login(); // zabbixUrl);

    hostsRet.hosts = await hosts();

    await zabbix.logout();
  } catch (e) {
    hostsRet.error = e;
    ctx.body = hostsRet;
    return;
  }

  ctx.body = hostsRet;
});

router.get('/Landscape/:id', async (ctx) => {
  const lsRet = {
    version: versionStr
  };

  try {
    await redis.login();

    // Retrieve DB info
    lsRet.landscape = await redis.getLandscape(ctx.params.id);

    await redis.logout();
  } catch (e) {
    lsRet.error = e;
    ctx.body = lsRet;
    return;
  }

  // Retrieve Zabbix info
  try {
    const zabbixUrl = lsRet.landscape.zabbix;
    await zabbix.login(zabbixUrl);

    const today = moment();
    const paramDate = Number.parseInt(ctx.query.date, 10) || +moment();

    // Current month till today, cant use end of month explicitly
    // (zabbix bug returns N days backwards - from prev month too)
    let firstDay = moment(paramDate).startOf('month');
    if (today < firstDay) {
      firstDay = today.clone().startOf('month');
    }
    let lastDay = moment(paramDate).endOf('month');
    if (today < lastDay) {
      lastDay = today;
    }

    // Get services as map, so it can be spread to landscape root and serviceUnits
    const servicesMap = await servicesAsMap(firstDay.unix(), lastDay.unix());

    // Create services array (will hold just 2 values)
    lsRet.landscape.services = [];

    lsRet.landscape.services.push({
      name: ZK.SLA_PRODUCTIVE,
      ...servicesMap.get(ZK.SLA_PRODUCTIVE)
    });
    lsRet.landscape.services.push({
      name: ZK.SLA_NONPRODUCTIVE,
      ...servicesMap.get(ZK.SLA_NONPRODUCTIVE)
    });

    // lsRet.landscape.hosts = await hosts();

    // Retrieve all relevant items
    lsRet.landscape.items = await items(firstDay.unix(), lastDay.unix());

    // Update sla to serviceUnits
    lsRet.landscape.items.serviceUnits.forEach((currentValue) => {
      if (currentValue.name && currentValue.name.last) {
        currentValue.sla = servicesMap.get(currentValue.name.last);
      }
    });

    await zabbix.logout();
  } catch (e) {
    debug('dev')(`Internal error catched ${e}/`);
    lsRet.error = e;
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

router.get('/Landscape/:id/general', async (ctx) => {
  const lsRet = {
    version: versionStr
  };

  try {
    await redis.login();

    // Retrieve DB info
    lsRet.landscape = await redis.getLandscape(ctx.params.id);

    await redis.logout();
  } catch (e) {
    lsRet.error = e;
    ctx.body = lsRet;
    return;
  }

  ctx.body = lsRet;
});

router.get('/Landscape/:id/status', async (ctx) => {
  const lsRet = {
    version: versionStr,
    error: 'Status: Not implemented'
  };
  await new Promise(r => setTimeout(r, 2000));
  ctx.body = lsRet;
});

router.get('/Landscape/:id/internal', async (ctx) => {
  const lsRet = {
    version: versionStr,
    error: 'Internal report list: Not implemented'
  };
  await new Promise(r => setTimeout(r, 2000));
  ctx.body = lsRet;
});

router.get('/Landscape/:id/external', async (ctx) => {
  const lsRet = {
    version: versionStr,
    error: 'External report list: Not implemented'
  };
  await new Promise(r => setTimeout(r, 2000));
  ctx.body = lsRet;
});

router.post('/Landscape', async (ctx) => {
  const lsRet = {
    version: versionStr
  };
  // Check for parameters
  if (ctx.request.body === undefined ||
    ctx.request.body.id === undefined ||
    ctx.request.body.domain === undefined ||
    ctx.request.body.zabbix === undefined) {
    lsRet.error = 'Wrong input';
    ctx.body = lsRet;
    return;
  }

  try {
    await redis.login();

    const lsId = ctx.request.body.id;

    if (await redis.existsLandscape(lsId)) {
      throw `Landscape ${lsId} already exists.`;
    }

    lsRet.added = await redis.addLandscape(ctx.request.body);

    await redis.logout();
  } catch (e) {
    lsRet.error = e;
    ctx.body = lsRet;
    return;
  }
  ctx.body = lsRet;
});

router.post('/Landscape.json', async (ctx) => {
  await new Promise(r => setTimeout(r, 2000));
  await send(ctx, ctx.path, { root: path.resolve(__dirname, 'content') });
});

router.get('/Hosts.json', async (ctx) => {
  await new Promise(r => setTimeout(r, 2000));
  await send(ctx, ctx.path, { root: path.resolve(__dirname, 'content') });
});

server.use(convert(koaMount('/', koaStatic(path.join(__dirname, 'public')))));

server.use(convert(body()));
server.use(router.routes());
server.use(router.allowedMethods());

server.use(async (ctx, next) => {
  if (ctx.request.url.includes('i18n')
  || ctx.request.url.includes('favicon.ico')
  || ctx.request.url.includes('Component-preload.js')
  || ctx.request.url.includes('.png')) {
    next();
  } else {
    ctx.redirect('/');
  }
});

server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://${host}/`);
});
